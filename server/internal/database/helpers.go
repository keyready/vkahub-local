package database

import "fmt"

func BuildConnectDSN(host, username, password, dbname string, port int, enableSSl bool) string {
	sslMode := getSslMode(enableSSl)

	return fmt.Sprintf(`host = %s port = %d user = %s password = %s dbname = %s sslmode = %s`,
		host,
		port,
		username,
		password,
		dbname,
		sslMode,
	)
}

func getSslMode(enableSSl bool) string {
	if enableSSl {
		return "enabled"
	}
	return "disable"
}
