package cloud

import (
	"bytes"
	"context"
	"fmt"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3Minio struct {
	mc     *minio.Client
	config *Config
}

func New(cfg *Config) *Cloud {
	minioOpts := &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.Username, cfg.Password, ""),
		Secure: cfg.EnableSSL,
	}

	client, err := minio.New(cfg.Address, minioOpts)
	if err != nil {
		log.Fatalf("failed to connect minio cloud: %v", err)
	}

	s3Minio := &S3Minio{
		config: cfg,
		mc:     client,
	}

	return &Cloud{
		Cloud: s3Minio,
	}
}

func (mw *S3Minio) InitBucket(ctx context.Context) error {
	opts := minio.MakeBucketOptions{}
	bucketPolicy := fmt.Sprintf(`
		{
			"Version":"2012-10-17",
			"Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},
			"Action":["s3:GetObject"],
			"Resource":["arn:aws:s3:::%s/*"]}]
		}`,
		mw.config.InitBucket,
	)

	_ = mw.mc.MakeBucket(ctx, mw.config.InitBucket, opts)
	_ = mw.mc.SetBucketPolicy(ctx, mw.config.InitBucket, bucketPolicy)

	return nil
}

func (mw *S3Minio) UploadFile(ctx context.Context, uploadPath string, fileData bytes.Buffer) error {
	opts := minio.PutObjectOptions{}
	fileDataLen := int64(fileData.Len())

	_, err := mw.mc.PutObject(ctx, mw.config.InitBucket, uploadPath, &fileData, fileDataLen, opts)
	return err
}

func (mw *S3Minio) RemoveFile(ctx context.Context, filePath string) error {
	opts := minio.RemoveObjectOptions{}
	return mw.mc.RemoveObject(ctx, mw.config.InitBucket, filePath, opts)
}
