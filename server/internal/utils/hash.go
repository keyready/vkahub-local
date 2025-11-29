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
	return bcrypt.CompareHashAndPassword([]byte(hashText), []byte(plainText)) == nil
}
