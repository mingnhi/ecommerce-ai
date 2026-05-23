import cloudinary from "@config/cloudinary.config";
import { BadRequestException, Injectable } from "@nestjs/common";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class UploadService {
  async uploadAvatar(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No avatar file uploaded');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            resource_type: 'image',
            transformation: [
              { width: 300, height: 300, crop: 'fill', gravity: 'face'},
              { quality: 'auto'},
              { fetch_format: 'auto'},
            ],
          },
          (error, result) => {
            if (error) {
              return reject(
                new BadRequestException( 'Failed to upload avatar: ' + error.message,),
              );
            }
            resolve(result as UploadApiResponse);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folderName = 'images',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderName,
            resource_type: 'image',

            transformation: [
              { width: 1000, height: 1000, crop: 'limit'},
              { quality: 'auto' },
              { fetch_format: 'auto'},
            ],
          },
          (error, result) => {
            if (error) {
              return reject(
                new BadRequestException(
                  'Failed to upload image: ' + error.message,
                ),
              );
            }

            resolve(result as UploadApiResponse);
          },
        )
        .end(file.buffer);
    });
  }
}