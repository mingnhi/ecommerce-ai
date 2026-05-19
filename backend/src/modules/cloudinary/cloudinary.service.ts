import cloudinary from "@config/cloudinary.config";
import { Injectable } from "@nestjs/common";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
  async uploadAvatar(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
          },
        )
        .end(file.buffer);
    });
  }
}