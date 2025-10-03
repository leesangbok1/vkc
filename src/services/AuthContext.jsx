'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithGoogle,
  signInWithFacebook,
  signOutUser,
  onAuthChange
} from '../api/firebase.js'

// 인증 컨텍스트 생성
const AuthContext = createContext()

// 인증 훅
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 인증 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 초기화 시 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  // 구글 로그인
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await signInWithGoogle()
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 페이스북 로그인
  const loginWithFacebook = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await signInWithFacebook()
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      setLoading(true)
      await signOutUser()
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 사용자 권한 확인
  const isAdmin = () => {
    return user?.isAdmin === true
  }

  const isExpert = () => {
    return user?.isExpert === true
  }

  // 컨텍스트 값
  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    isAdmin,
    isExpert,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}