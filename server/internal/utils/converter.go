package utils

import (
	"encoding/json"

	"gorm.io/datatypes"
)

func ToJSON(data interface{}) (datatypes.JSON, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	return datatypes.JSON(jsonData), nil
}

func FromJSON(jsonData datatypes.JSON, data interface{}) error {
	return json.Unmarshal(jsonData, &data)
}

// func FromJSON(jsonData []byte, data interface{}) error {
// 	return json.Unmarshal(jsonData, &data)
// }
