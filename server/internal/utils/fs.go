package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func FindAndDeleteFile(dirPath, subname string) error {
	fileNameToDel := ""

	err := filepath.WalkDir(dirPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		if !d.IsDir() && strings.Contains(d.Name(), subname) {
			fileNameToDel = path
			return filepath.SkipAll
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to find file: %v", err)
	}

	if fileNameToDel == "" {
		return fmt.Errorf("file for substring name not found")
	}

	err = os.Remove(fileNameToDel)
	if err != nil {
		return fmt.Errorf("failed to delete file: %v", err)
	}

	return nil
}
