# backend/services/cloudinary_init.py

import cloudinary
from config import get_settings

settings = get_settings()

print("Cloudinary Config Debug:", {
    "cloud_name": settings.cloudinary_cloud_name,
    "api_key": settings.cloudinary_api_key,
    "api_secret_exists": settings.cloudinary_api_secret is not None,
})

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)