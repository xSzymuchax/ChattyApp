const fs = require("fs/promises");
const path = require("path");
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
} = require("@aws-sdk/client-s3");

const uploadDir = () =>
    process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");

const filePathFor = (messageId) =>
    path.join(uploadDir(), `${Number(messageId)}`);

const objectKey = (messageId) => `attachments/${Number(messageId)}`;
const legacyObjectKey = (messageId) => String(Number(messageId));

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

const saveAttachment = async (messageId, buffer) => {
    const store = objectStore();

    if (!store) {
        await fs.mkdir(uploadDir(), { recursive: true });
        await fs.writeFile(filePathFor(messageId), buffer);
        return;
    }

    await ensureBucket(store);
    await store.client.send(new PutObjectCommand({
        Bucket: store.bucket,
        Key: objectKey(messageId),
        Body: buffer,
    }));
};

const readObject = async (store, key) => {
    try {
        const response = await store.client.send(new GetObjectCommand({
            Bucket: store.bucket,
            Key: key,
        }));

        return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
        if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404)
            return null;

        throw error;
    }
};

const readAttachment = async (messageId) => {
    const store = objectStore();

    if (!store) {
        try {
            return await fs.readFile(filePathFor(messageId));
        } catch (error) {
            if (error.code === "ENOENT")
                return null;

            throw error;
        }
    }

    const current = await readObject(store, objectKey(messageId));

    if (current)
        return current;

    const legacy = await readObject(store, legacyObjectKey(messageId));

    if (!legacy)
        return null;

    await store.client.send(new PutObjectCommand({
        Bucket: store.bucket,
        Key: objectKey(messageId),
        Body: legacy,
    }));
    await store.client.send(new DeleteObjectCommand({
        Bucket: store.bucket,
        Key: legacyObjectKey(messageId),
    }));

    return legacy;
};

const deleteAttachment = async (messageId) => {
    const store = objectStore();

    if (!store) {
        try {
            await fs.unlink(filePathFor(messageId));
        } catch (error) {
            if (error.code !== "ENOENT")
                throw error;
        }
        return;
    }

    await store.client.send(new DeleteObjectCommand({
        Bucket: store.bucket,
        Key: objectKey(messageId),
    }));
    await store.client.send(new DeleteObjectCommand({
        Bucket: store.bucket,
        Key: legacyObjectKey(messageId),
    }));
};

module.exports = {
    saveAttachment,
    readAttachment,
    deleteAttachment,
};
