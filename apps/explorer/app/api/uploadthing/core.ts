import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Fake auth function - replace with your actual auth
const auth = (req: Request) => {
    // TODO: Implement actual authentication check
    // For now, allow all uploads
    return { id: "user" };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter: FileRouter = {
    // Image uploader for profile and header images
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            // This code runs on your server before upload
            const user = await auth(req);

            // If you throw, the user will not be able to upload
            if (!user) throw new UploadThingError("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);

            // Return data to the client
            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Thumbnail uploader (20MB max)
    thumbnailUploader: f({
        image: {
            maxFileSize: "32MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            const user = await auth(req);
            if (!user) throw new UploadThingError("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Thumbnail upload complete:", file.url);
            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Video uploader (64MB max)
    videoUploader: f({
        video: {
            maxFileSize: "64MB",
            maxFileCount: 1,
        },
    })
        .middleware(async ({ req }) => {
            const user = await auth(req);
            if (!user) throw new UploadThingError("Unauthorized");
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Video upload complete:", file.url);
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
