package cloud

import (
	"bytes"
	"context"
	"time"
)

type Cloud struct {
	Cloud ICloud
}

type ICloud interface {
	IBucket
	IFile
	IShare
}

type IBucket interface {
	InitBucket(ctx context.Context) error
}

type IFile interface {
	UploadFile(ctx context.Context, uploadPath string, fileData bytes.Buffer) error
	RemoveFile(ctx context.Context, filePath string) error
}

type IShare interface {
	GetSharedURL(ctx context.Context, filePath string, expires time.Duration) (string, error)
}
