package utils

import "encoding/json"

func ToJSON(data interface{}) []byte {
	jsonData, _ := json.Marshal(data)
	return jsonData
}
