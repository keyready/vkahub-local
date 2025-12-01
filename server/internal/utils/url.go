package utils

import "net/url"

func ParseURL(fullURL string) string {
	parsed, _ := url.Parse(fullURL)
	return parsed.Path
}
