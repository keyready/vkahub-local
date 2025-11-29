package cloud

import (
	"bytes"
	"context"
	"log"
	"server/internal/utils"
	"time"

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
	return mw.mc.MakeBucket(ctx, mw.config.MainBucket, opts)
}

func (mw *S3Minio) UploadFile(ctx context.Context, uploadPath string, fileData bytes.Buffer) error {
	opts := minio.PutObjectOptions{}
	fileDataLen := int64(fileData.Len())

	_, err := mw.mc.PutObject(ctx, mw.config.MainBucket, uploadPath, &fileData, fileDataLen, opts)
	return err
}

func (mw *S3Minio) RemoveFile(ctx context.Context, filePath string) error {
	opts := minio.RemoveObjectOptions{}
	return mw.mc.RemoveObject(ctx, mw.config.MainBucket, filePath, opts)
}

func (mw *S3Minio) GetSharedURL(ctx context.Context, filePath string, expires time.Duration) (string, error) {
	params := make(map[string][]string)
	url, err := mw.mc.PresignedGetObject(ctx, mw.config.MainBucket, filePath, expires, params)
	if err != nil {
		return "", err
	}

	return utils.ParseURL(url.String()), nil
}
