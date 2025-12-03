package cloud

import (
	"bytes"
	"context"
)

type Cloud struct {
	Cloud ICloud
}

type ICloud interface {
	IBucket
	IFile
}

type IBucket interface {
	InitBucket(ctx context.Context) error
}

type IFile interface {
	UploadFile(ctx context.Context, uploadPath string, fileData bytes.Buffer) error
	RemoveFile(ctx context.Context, filePath string) error
}
