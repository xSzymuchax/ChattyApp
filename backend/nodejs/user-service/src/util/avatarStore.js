const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} = require("@aws-sdk/client-s3");

const MARKER = Buffer.from([1]);

let s3Client = null;
let bucketReady = null;

const objectStore = () => {
    if (!process.env.S3_ENDPOINT)
        return null;

    if (!s3Client) {
        s3Client = new S3Client({
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || "us-east-1",
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY || "",
                secretAccessKey: process.env.S3_SECRET_KEY || "",
            },
        });
    }

    return {
        client: s3Client,
        bucket: process.env.S3_BUCKET || "chatty-data",
    };
};

const ensureBucket = async (store) => {
    if (!bucketReady) {
        bucketReady = (async () => {
            try {
                await store.client.send(new HeadBucketCommand({ Bucket: store.bucket }));
            } catch (error) {
                if (error?.name !== "NotFound" && error?.$metadata?.httpStatusCode !== 404)
                    throw error;

                await store.client.send(new CreateBucketCommand({ Bucket: store.bucket }));
            }
        })().catch((error) => {
            bucketReady = null;
            throw error;
        });
    }

    await bucketReady;
};

const keyFor = (userId) => `avatars/${Number(userId)}`;

const saveAvatar = async (userId, buffer) => {
    const store = objectStore();

    if (!store)
        return false;

    await ensureBucket(store);
    await store.client.send(new PutObjectCommand({
        Bucket: store.bucket,
        Key: keyFor(userId),
        Body: buffer,
        ContentType: "image/webp",
    }));
    return true;
};

const readAvatar = async (userId) => {
    const store = objectStore();

    if (!store)
        return null;

    try {
        const response = await store.client.send(new GetObjectCommand({
            Bucket: store.bucket,
            Key: keyFor(userId),
        }));

        return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
        if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404)
            return null;

        throw error;
    }
};

module.exports = {
    MARKER,
    saveAvatar,
    readAvatar,
};
