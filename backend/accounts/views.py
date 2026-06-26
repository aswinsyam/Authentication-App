from rest_framework.response import Response
from rest_framework.decorators import api_view
from .mongodb import users_collection
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
import os


def get_tokens_for_user(user):

    refresh = RefreshToken()

    refresh["email"] = user["email"]
    refresh["username"] = user["username"]

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

@api_view(['GET'])
def hello(request):
    return Response({
        "message": "Hello Aswin",
        "status": "success"
    })

@api_view(['POST'])
def register(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username:
        return Response(
            {"error": "Username required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not email:
        return Response(
            {"error": "Email required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not password:
        return Response(
            {"error": "Password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return Response(
        {
            "error": "User already exists with this email."
        },
        status=status.HTTP_400_BAD_REQUEST
    )

    user = {
        "username": username,
        "email": email,
        "password": make_password(password)
    }

    result = users_collection.insert_one(user)

    return Response(
        {
            "message": "User Registered Successfully",
            "id": str(result.inserted_id)
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    user = users_collection.find_one({"email": email})

    if not user:
        return Response({
            "error": "User not found"
        })

    if not check_password(password, user["password"]):
        return Response({
            "error": "Invalid password"
        })

    tokens = get_tokens_for_user(user)

    return Response({
        "message": "Login Successful",
        "username": user["username"],
        "tokens": tokens
    })



@api_view(['GET'])
def all_users(request):

    users = list(users_collection.find({}, {"password": 0}))

    for user in users:
        user["_id"] = str(user["_id"])

    return Response(users)



@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):

    email = request.GET.get("email")

    user = users_collection.find_one(
        {"email": email},
        {"password": 0}
    )

    if not user:
        return Response({
            "error": "User not found"
        })

    user["_id"] = str(user["_id"])

    return Response(user)

@api_view(['PUT'])
def update_profile(request):

    email = request.data.get("email")
    username = request.data.get("username")
    new_email = request.data.get("new_email")

    update_data = {}

    # Update username only if provided
    if username:
        update_data["username"] = username

    # Update email only if provided
    if new_email:
        update_data["email"] = new_email

    result = users_collection.update_one(
        {"email": email},
        {
            "$set": update_data
        }
    )

    if result.modified_count > 0:
        return Response({
            "message": "Profile Updated Successfully"
        })

    return Response({
        "error": "User Not Found"
    })



@api_view(['POST'])
def upload_profile_image(request):

    email = request.data.get("email")
    image = request.FILES.get("image")

    if not image:
        return Response({
            "error": "No image selected"
        })

    folder = "media"

    if not os.path.exists(folder):
        os.makedirs(folder)

    filepath = os.path.join(folder, image.name)

    with open(filepath, "wb+") as destination:
        for chunk in image.chunks():
            destination.write(chunk)

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "profile_image": image.name
            }
        }
    )

    return Response({
        "message": "Image Uploaded Successfully"
    })