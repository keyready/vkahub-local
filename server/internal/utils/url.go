package utils

import "net/url"

func ParseURL(fullURL string) string {
	parsed, _ := url.Parse(fullURL)

	result := parsed.Path
	if parsed.RawQuery != "" {
		result += "?" + parsed.RawQuery
	}

	return result
}
