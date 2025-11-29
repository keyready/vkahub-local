package utils

import (
	"bytes"
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/google/uuid"
)

type ReadFileParams struct {
	File    *multipart.FileHeader
	SaveDir string
}

type ReadFileResult struct {
	FileData bytes.Buffer
	FilePath string
	FileName string
}

func ReadFile(params ReadFileParams) (ReadFileResult, error) {
	result := ReadFileResult{}

	fileData := bytes.Buffer{}

	fileHandler, err := params.File.Open()
	if err != nil {
		return result, fmt.Errorf("Ошибка обработки файла %s: %v", params.File.Filename, err)
	}
	defer func() { _ = fileHandler.Close() }()

	fileData.Reset()
	_, err = fileData.ReadFrom(fileHandler)
	if err != nil {
		return result, fmt.Errorf("Ошибка чтения файла %s: %v", params.File.Filename, err)
	}

	result.FileData = fileData

	fileName := fmt.Sprintf(
		"%s%s",
		uuid.NewString(),
		filepath.Ext(params.File.Filename),
	)
	filePath := filepath.Join(
		params.SaveDir,
		fileName,
	)

	result.FilePath = filePath
	result.FileName = fileName

	return result, nil
}
