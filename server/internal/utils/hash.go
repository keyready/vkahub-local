package utils

import "golang.org/x/crypto/bcrypt"

func GenerateHash(plainText string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(plainText), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}

func CompareHash(hashText string, plainText string) bool {
	hashBytes := []byte(hashText)
	plainBytes := []byte(plainText)

	if err := bcrypt.CompareHashAndPassword(hashBytes, plainBytes); err != nil {
		return false
	}

	return true
}
