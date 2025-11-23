import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const helpers = generateReactHelpers<OurFileRouter>();

export const useUploadThing = helpers.useUploadThing;
export const uploadFiles = helpers.uploadFiles;
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
