package database

type PortfolioFile struct {
	EventName string `json:"eventName"`
	Place     string `json:"place"`
	Url       string `json:"url"`
	Type      string `json:"type"`
}

type RecoveryQuestion struct {
	Question string `json:"recoveryQuestion"`
	Answer   string `json:"recoveryAnswer"`
}

type ImageObj struct {
	Image string `json:"image"`
	Hash  string `json:"hash"`
}
