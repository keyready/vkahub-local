package hash

import "golang.org/x/crypto/bcrypt"

func HashData(str string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func CheckHashData(hash string, data string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(data)); err != nil {
		return false
	}
	return true
}
