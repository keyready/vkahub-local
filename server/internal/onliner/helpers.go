package onliner

import "strings"

func BuildKeyRecord(params ...string) string {
	builder := strings.Builder{}

	builder.WriteString("online")

	if len(params) > 0 {
		for index, param := range params {
			if index > 0 {
				builder.WriteString(":")
			}
			builder.WriteString(param)
		}
	} else {
		builder.WriteString(":")
		builder.WriteString("*")
	}

	keyRecord := builder.String()
	return keyRecord
}
