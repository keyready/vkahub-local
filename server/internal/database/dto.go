package database

type PortfolioFile struct {
	Name      string `json:"name"`
	EventName string `json:"eventName"`
	Place     string `json:"place"`
	Url       string `json:"url"`
	Type      string `json:"type"`
}

type RecoveryQuestion struct {
	Question string `json:"recoveryQuestion"`
	Answer   string `json:"-"`
}
