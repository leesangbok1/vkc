'use client'

import React, { useState, useEffect } from 'react'
import { UserRole, getRoleDisplayInfo } from '@/lib/utils/permissions'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Settings,
  Mail,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Lock
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: UserRole
  createdAt: string
  lastLogin: string | null
  isActive: boolean
  questionsCount: number
  answersCount: number
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null
}

interface UserManagementProps {
  userRole: UserRole
}

export default function UserManagement({ userRole }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER)
  const [loading, setLoading] = useState(false)

  // 권한 확인
  const isAdmin = userRole === UserRole.ADMIN

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Mock 데이터 (실제로는 API 호출)
      const mockUsers: UserData[] = [
        {
          id: '1',
          email: 'admin@vietkconnect.com',
          name: '관리자',
          role: UserRole.ADMIN,
          createdAt: '2024-01-15T09:00:00Z',
          lastLogin: '2024-12-05T14:30:00Z',
          isActive: true,
          questionsCount: 5,
          answersCount: 28,
          verificationStatus: 'approved'
        },
        {
          id: '2',
          email: 'nguyen.minh@example.com',
          name: 'Nguyen Minh',
          role: UserRole.VERIFIED,
          createdAt: '2024-03-20T10:15:00Z',
          lastLogin: '2024-12-05T16:20:00Z',
          isActive: true,
          questionsCount: 12,
          answersCount: 45,
          verificationStatus: 'approved'
        },
        {
          id: '3',
          email: 'tran.linh@example.com',
          name: 'Tran Linh',
          role: UserRole.USER,
          createdAt: '2024-08-10T14:22:00Z',
          lastLogin: '2024-12-04T11:45:00Z',
          isActive: true,
          questionsCount: 8,
          answersCount: 15,
          verificationStatus: 'pending'
        },
        {
          id: '4',
          email: 'le.duc@example.com',
          name: 'Le Duc',
          role: UserRole.USER,
          createdAt: '2024-09-05T16:30:00Z',
          lastLogin: '2024-12-03T09:10:00Z',
          isActive: true,
          questionsCount: 3,
          answersCount: 7,
          verificationStatus: null
        },
        {
          id: '5',
          email: 'pham.anh@example.com',
          name: 'Pham Anh',
          role: UserRole.USER,
          createdAt: '2024-11-12T11:00:00Z',
          lastLogin: null,
          isActive: false,
          questionsCount: 1,
          answersCount: 0,
          verificationStatus: 'rejected'
        }
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 역할 필터
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive)
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.isActive)
      } else if (statusFilter === 'pending_verification') {
        filtered = filtered.filter(user => user.verificationStatus === 'pending')
      }
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async () => {
    if (!selectedUser) return

    try {
      // 실제로는 API 호출
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id
          ? { ...user, role: newRole }
          : user
      )
      setUsers(updatedUsers)
      setIsRoleChangeDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to change user role:', error)
    }
  }

  const handleUserStatusToggle = async (userId: string) => {
    try {
      const updatedUsers = users.map(user =>
        user.id === userId
          ? { ...user, isActive: !user.isActive }
          : user
      )
      setUsers(updatedUsers)
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="w-4 h-4" />
      case UserRole.VERIFIED:
        return <Shield className="w-4 h-4" />
      case UserRole.USER:
        return <User className="w-4 h-4" />
      case UserRole.GUEST:
        return <Lock className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">접근 권한 없음</CardTitle>
          <CardDescription>
            관리자만 사용자 관리 기능에 접근할 수 있습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            사용자 관리
          </CardTitle>
          <CardDescription>
            플랫폼 사용자 검색, 역할 변경, 계정 상태 관리
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="이메일 또는 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value={UserRole.ADMIN}>관리자</SelectItem>
                <SelectItem value={UserRole.VERIFIED}>인증사용자</SelectItem>
                <SelectItem value={UserRole.USER}>일반사용자</SelectItem>
                <SelectItem value={UserRole.GUEST}>게스트</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="pending_verification">인증 대기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 사용자 테이블 */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>활동</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue"></div>
                        <span className="ml-2">로딩 중...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      사용자를 찾을 수 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", getRoleDisplayInfo(user.role).badgeColor)}>
                          {getRoleIcon(user.role)}
                          {getRoleDisplayInfo(user.role).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.isActive ? "default" : "secondary"} className="w-fit">
                            {user.isActive ? "활성" : "비활성"}
                          </Badge>
                          {user.verificationStatus && (
                            <Badge
                              variant={
                                user.verificationStatus === 'approved' ? "default" :
                                user.verificationStatus === 'pending' ? "secondary" : "destructive"
                              }
                              className="w-fit text-xs"
                            >
                              {user.verificationStatus === 'approved' ? '인증완료' :
                               user.verificationStatus === 'pending' ? '인증대기' : '인증거부'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>질문: {user.questionsCount}</div>
                          <div>답변: {user.answersCount}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {user.lastLogin ? formatDate(user.lastLogin) : '로그인 기록 없음'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setNewRole(user.role)
                              setIsRoleChangeDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserStatusToggle(user.id)}
                            className={user.isActive ? "text-red-600" : "text-green-600"}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 역할 변경 다이얼로그 */}
      <Dialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 역할 변경</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.email}의 역할을 변경합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">현재 역할</label>
              <div className="mt-1">
                <Badge className={getRoleDisplayInfo(selectedUser?.role || UserRole.USER).badgeColor}>
                  {getRoleIcon(selectedUser?.role || UserRole.USER)}
                  {getRoleDisplayInfo(selectedUser?.role || UserRole.USER).label}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">새 역할</label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      관리자
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.VERIFIED}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      인증사용자
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.USER}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      일반사용자
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.GUEST}>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      게스트
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleChangeDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRoleChange}>
              역할 변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}