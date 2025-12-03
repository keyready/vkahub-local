package cmd

import (
	"log"
	"os"
	"server/internal/config"

	"github.com/spf13/cobra"
)

var serviceConfig *config.VkaHubConfig

var rootCmd = &cobra.Command{
	Use:     "./vkahub",
	Version: "1.0.0",
	Short:   "VkaHub - проект, разработанный для аггрегации и мониторинга деятельности военно-научного общества 61 кафедры ВКА им.А.Ф.Можайского",
	Long: `
		VkaHub - проект, разработанный для аггрегации и мониторинга деятельности военно-научного общества 61 кафедры ВКА им.А.Ф.Можайского
	`,

	Run: func(cmd *cobra.Command, _ []string) {
		var parseErr error
		configFilePath, _ := cmd.Flags().GetString("config-path")
		serviceConfig, parseErr = config.FromFile(configFilePath)
		if parseErr != nil {
			log.Fatalln(parseErr)
		}
	},
}

func Execute() *config.VkaHubConfig {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
	return serviceConfig
}

func init() {
	flags := rootCmd.Flags()
	flags.StringP("config-path", "c", "configs/production.yaml", "Parse options from config file")
}
