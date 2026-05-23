// import { httpClient } from "./http";

// import type {
//   ProductImage,
// } from "@/features/product-images/types/product-image.type";

// /**
//  * normalize image
//  */
// const normalizeImage = (
//   image: any
// ): ProductImage => {
//   return {
//     id: String(image.id),

//     imageUrl:
//       image.imageUrl,

//     type: image.type,

//     sortOrder:
//       image.sortOrder,

//     isPrimary:
//       image.isPrimary,

//     createdAt:
//       image.createdAt,
//   };
// };

// /**
//  * upload image
//  */
// export const uploadProductImage =
//   async (
//     productId: string,
//     payload: {
//       file: File;

//       type?: string;

//       sortOrder?: number;
//     }
//   ) => {
//     const formData =
//       new FormData();

//     formData.append(
//       "file",
//       payload.file
//     );

//     if (payload.type) {
//       formData.append(
//         "type",
//         payload.type
//       );
//     }

//     if (
//       payload.sortOrder !==
//       undefined
//     ) {
//       formData.append(
//         "sortOrder",
//         String(
//           payload.sortOrder
//         )
//       );
//     }

//     const res =
//       await httpClient.post(
//         `/products/${productId}/images`,
//         formData,
//         {
//           headers: {
//             "Content-Type":
//               "multipart/form-data",
//           },
//         }
//       );

//     return {
//       image:
//         normalizeImage(
//           res.data?.data
//             ?.image
//         ),
//     };
//   };

// /**
//  * set thumbnail
//  */
// export const setProductThumbnail =
//   async (
//     imageId: string
//   ) => {
//     const res =
//       await httpClient.patch(
//         `/images/${imageId}/thumbnail`
//       );

//     return res.data;
//   };

// /**
//  * delete image
//  */
// export const deleteProductImage =
//   async (
//     imageId: string
//   ) => {
//     const res =
//       await httpClient.delete(
//         `/images/${imageId}`
//       );

//     return res.data;
//   };

