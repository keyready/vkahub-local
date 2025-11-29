package onliner

type Onliner struct {
	Onliner IOnliner
}

type IOnliner interface {
	// IUser
	// IManage
}

// type IManage interface {
// 	UpdateLastSeen()
// 	MarkOnline()
// }

// type IUser interface {
// 	GetOnlineUsers()
// 	IsUserOnline()
// 	RemoveUser()
// }
