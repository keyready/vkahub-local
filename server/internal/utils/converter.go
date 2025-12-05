package utils

import "encoding/json"

func ToJSON(data interface{}) []byte {
	jsonData, _ := json.Marshal(data)
	return jsonData
}

func FromJSON(jsonData []byte, data interface{}) error {
	return json.Unmarshal(jsonData, &data)
}
