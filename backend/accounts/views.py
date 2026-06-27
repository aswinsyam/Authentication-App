from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from .mongodb import users_collection

import os
import uuid


# -------------------------
# JWT Helper
# -------------------------

def get_tokens_for_user(user):

    refresh = RefreshToken()

    refresh["email"] = user["email"]
    refresh["username"] = user["username"]

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# -------------------------
# Logged-in User
# -------------------------

def get_logged_in_user(request):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise AuthenticationFailed("Authorization header missing")

    try:

        parts = auth_header.split(" ")
        if len(parts) != 2:
            raise AuthenticationFailed(f"Invalid Authorization header format: {auth_header}")
        token = parts[1]

        decoded = AccessToken(token)
        print("DECODED JWT payload:", decoded)
        print("DECODED email claim:", decoded.get('email'))



        email = decoded.get("email")
        if not email:
            raise AuthenticationFailed("Token missing email claim")


        user = users_collection.find_one(
            {"email": email}
        )

        if not user:
            raise AuthenticationFailed("User not found")

        return user

    except Exception:
        raise AuthenticationFailed("Invalid Token")


# -------------------------
# Hello
# -------------------------

@api_view(["GET"])
def hello(request):

    return Response({
        "message": "Hello Aswin",
        "status": "success"
    })


# -------------------------
# Register
# -------------------------

@api_view(["POST"])
def register(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    image = request.FILES.get("image")

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

    existing = users_collection.find_one({"email": email})

    if existing:
        return Response(
            {"error": "User already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    filename = None

    if image:

        folder = "media"

        if not os.path.exists(folder):
            os.makedirs(folder)

        extension = image.name.split(".")[-1]

        filename = f"{uuid.uuid4()}.{extension}"

        filepath = os.path.join(folder, filename)

        with open(filepath, "wb+") as destination:

            for chunk in image.chunks():

                destination.write(chunk)

    user = {

        "username": username,

        "email": email,

        "password": make_password(password),

        "profile_image": filename

    }

    result = users_collection.insert_one(user)

    return Response({

        "message": "User Registered Successfully",

        "id": str(result.inserted_id)

    }, status=status.HTTP_201_CREATED)


# -------------------------
# Login
# -------------------------

@api_view(["POST"])
def login(request):

    print(request.data)

    email = request.data.get("email")
    password = request.data.get("password")

    print(email)
    print(password)

    user = users_collection.find_one({"email": email})

    print(user)

    if not user:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, user["password"]):
        return Response(
            {"error": "Invalid password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    tokens = get_tokens_for_user(user)

    return Response({
        "message": "Login Successful",
        "username": user["username"],
        "tokens": tokens
    })

# -------------------------
# Profile
# -------------------------

@api_view(["GET"])
@permission_classes([])
def profile(request):
    # Ensure DRF doesn't block before our manual JWT parsing
    # (Authentication/permission set per-view is not used; we parse Authorization in get_logged_in_user)
    

    try:

        user = get_logged_in_user(request)

        user["_id"] = str(user["_id"])

        user.pop("password", None)

        return Response({

            "_id": user["_id"],

            "username": user["username"],

            "email": user["email"],

            "profile_image": user.get("profile_image")

        })

    except AuthenticationFailed as e:

        return Response(
            {
                "error": str(e)
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


# -------------------------
# All Users
# -------------------------

@api_view(["GET"])
def all_users(request):

    users = list(

        users_collection.find(
            {},
            {
                "password": 0
            }
        )

    )

    data = []

    for user in users:

        data.append({

            "_id": str(user["_id"]),

            "username": user["username"],

            "email": user["email"],

            "profile_image": user.get("profile_image")

        })

    return Response(data)

# -------------------------
# Update Profile
# -------------------------

@api_view(["PUT"])
def update_profile(request):

    try:

        # Logged-in user from JWT
        logged_user = get_logged_in_user(request)

        current_email = logged_user["email"]

        username = request.data.get("username")
        new_email = request.data.get("new_email")

        update_data = {}

        # Update username
        if username:

            update_data["username"] = username

        # Update email
        if new_email:

            # Check whether another account already uses this email
            existing = users_collection.find_one(
                {
                    "email": new_email
                }
            )

            if existing and existing["email"] != current_email:

                return Response(
                    {
                        "error": "Email already exists"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            update_data["email"] = new_email

        if not update_data:

            return Response(
                {
                    "error": "Nothing to update"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        users_collection.update_one(
            {
                "email": current_email
            },
            {
                "$set": update_data
            }
        )

        updated_user = users_collection.find_one(
            {
                "email": new_email if new_email else current_email
            }
        )

        return Response({

            "message": "Profile Updated Successfully",

            "username": updated_user["username"],

            "email": updated_user["email"]

        })

    except AuthenticationFailed as e:

        return Response(
            {
                "error": str(e)
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
    
# -------------------------
# Upload Profile Image
# -------------------------

@api_view(["POST"])
def upload_profile_image(request):

    try:

        # Get logged-in user from JWT
        logged_user = get_logged_in_user(request)

        current_email = logged_user["email"]

        image = request.FILES.get("image")

        if not image:

            return Response(
                {
                    "error": "No image selected"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        folder = "media"

        if not os.path.exists(folder):
            os.makedirs(folder)

        # Create unique filename
        extension = image.name.split(".")[-1]

        filename = f"{uuid.uuid4()}.{extension}"

        filepath = os.path.join(folder, filename)

        with open(filepath, "wb+") as destination:

            for chunk in image.chunks():

                destination.write(chunk)

        # Delete old image if exists
        old_user = users_collection.find_one(
            {
                "email": current_email
            }
        )

        old_image = old_user.get("profile_image")

        if old_image:

            old_path = os.path.join(folder, old_image)

            if os.path.exists(old_path):
                os.remove(old_path)

        # Save new image
        users_collection.update_one(
            {
                "email": current_email
            },
            {
                "$set": {
                    "profile_image": filename
                }
            }
        )

        return Response({

            "message": "Profile image uploaded successfully",

            "profile_image": filename

        })

    except AuthenticationFailed as e:

        return Response(
            {
                "error": str(e)
            },
            status=status.HTTP_401_UNAUTHORIZED
        )