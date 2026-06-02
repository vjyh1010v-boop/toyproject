import React, { useState } from 'react';
import axios from 'axios'; // 💡 1. 누락되었던 axios 임포트 추가!
import './Signup.css';    // 💡 2. CSS 파일명 대소문자 확인 (실제 파일명이 Signup.css 또는 Auth.css인지 맞춰주세요)

function SignUp({ onLoginSuccess, onClose }) {
    // isLogin: true = 로그인, false = 회원가입
    const [isLogin, setIsLogin] = useState(true);
    
    // 입력 바구니
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // 🌟 [추가] 새로운 입력 바구니들
    const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인용
    const [birthDate, setBirthDate] = useState('');             // 생년월일용 (YYYY-MM-DD)
    const [phone, setPhone] = useState('');                     // 연락처용 (010-XXXX-XXXX)
    
    // 메시지 출력 바구니 (성공 또는 에러)
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // [회원가입] 또는 [로그인] 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (isLogin) {
            // 🔑 로그인 처리
            try {
                const response = await axios.post('http://localhost:8080/api/auth/login', {
                    username: username,
                    password: password
                });

                // 성공 메시지
                setMessage('로그인에 성공했습니다!');
                setIsError(false);

                // 🌟 [보안 권한 추가] 로그인 성공 시 브라우저 스토리지에 유저 아이디 저장!
                if (response.data && response.data.username) {
                localStorage.setItem('username', response.data.username);
                }

                // 상위 컴포넌트에 유저 정보 전달
                if (onLoginSuccess) {
                    onLoginSuccess(response.data);
                }
                
                // 모달 닫기
                if (onClose) {
                    setTimeout(() => {
                        onClose();
                    }, 500);
                }
            } catch (error) {
                setIsError(true);
                // 백엔드가 에러 응답을 준 경우
                if (error.response) {
                    setMessage(error.response.data || '아이디 또는 비밀번호를 확인해주세요.');
                } else {
                    // 서버가 완전히 꺼져있거나 네트워크 자체가 단절된 경우
                    setMessage('서버와 연결할 수 없습니다. 백엔드 상태를 확인해주세요.');
                }
            }
        } else {
            // 🔒 회원가입 처리

            // 🌟 [추가 방어벽] 비밀번호와 비밀번호 확인이 일치하지 않으면 백엔드로 요청을 보내지 않고 차단!
            if (password !== confirmPassword) {
                setIsError(true);
                setMessage('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
                return; // 여기서 함수를 종료시켜 전송을 막습니다.
            }

            try {
                const response = await axios.post('http://localhost:8080/api/auth/signup', {
                    username: username,
                    password: password,
                    name: name,
                    birthDate: birthDate, // 🌟 추가
                    phone: phone          // 🌟 추가
                });

                setMessage(response.data || '회원가입이 완료되었습니다!');
                setIsError(false);

                // 회원가입 성공 후, 깔끔하게 로그인 창으로 모드 변경
                setTimeout(() => {
                    setIsLogin(true);
                    setPassword('');
                    setConfirmPassword(''); // 🌟 추가
                    setName('');
                    setBirthDate('');       // 🌟 추가
                    setPhone('');           // 🌟 추가
                    setMessage('가입하신 계정으로 로그인해주세요!');
                }, 1500);

            } catch (error) {
                setIsError(true);
                if (error.response) {
                    setMessage(error.response.data);
                } else {
                    setMessage('서버와 통신 중 오류가 발생했습니다.');
                }
            }
        }
    };

    const handleModeSwitch = (loginMode) => {
        setIsLogin(loginMode);
        setMessage('');
        setIsError(false);
        setPassword('');
        setConfirmPassword(''); // 🌟 추가
        setName('');
        setBirthDate('');       // 🌟 추가
        setPhone('');           // 🌟 추가
    };

    return (
        <div style={styles.container}>
            {/* 상단 로그인/회원가입 탭 토글 */}
            <div style={styles.toggleContainer}>
                <button 
                    type="button" 
                    style={isLogin ? styles.activeTab : styles.inactiveTab}
                    onClick={() => handleModeSwitch(true)}
                >
                    🔑 로그인
                </button>
                <button 
                    type="button" 
                    style={!isLogin ? styles.activeTab : styles.inactiveTab}
                    onClick={() => handleModeSwitch(false)}
                >
                    🔒 회원가입
                </button>
            </div>

            <h2 style={styles.title}>
                {isLogin ? '로그인을 환영합니다' : '새로운 계정 만들기'}
            </h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input 
                    type="text" 
                    placeholder="아이디 입력" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    style={styles.input}
                    autoComplete="username"
                />
                <input 
                    type="password" 
                    placeholder="비밀번호 입력" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={styles.input}
                    autoComplete="current-password" // 신규 가입이므로 new-password 권장
                />
                {/* 🌟 [추가] 회원가입 모드일 때만 보이는 추가 필드들 */}
                {!isLogin && (
                    <>
                        <input 
                            type="password" 
                            placeholder="비밀번호 확인" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            style={styles.input}
                            autoComplete="new-password"
                        />
                        <input 
                            type="text" 
                            placeholder="이름 입력" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            style={styles.input}
                            autoComplete="name"
                        />
                        <input 
                            type="text" // 💡 일반 텍스트 타입으로 변경하여 달력 아이콘을 제거합니다.
                            inputMode="numeric" // 💡 모바일 기기 등에서 숫자가 먼저 뜨도록 유도합니다.
                            maxLength={8} // 💡 8자리 이상 입력되지 않도록 제한을 걸어줍니다.
                            placeholder="생년월일 8자리 (예: 2001231)" // 💡 원하시는 힌트 텍스트로 변경!
                            value={birthDate} 
                            onChange={(e) => {
                                // 💡 오직 숫자만 입력받을 수 있도록 필터링하는 안전장치입니다.
                                const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
                                setBirthDate(onlyNumber);
                            }} 
                            required 
                            style={styles.input} // 💡 다른 input창들과 완벽히 일치하는 스타일 적용
                        />
                        <input 
                            type="tel" 
                            placeholder="연락처 입력 (예: 010-1234-5678)" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                            style={styles.input}
                        />
                    </>
                )}
                
                <button type="submit" style={styles.button}>
                    {isLogin ? '로그인' : '가입하기'}
                </button>
            </form>

            {message && (
                <p style={{
                    ...styles.message, 
                    color: isError ? '#ff6b6b' : '#ffeb3b'
                }}>
                    {message}
                </p>
            )}

            <div style={styles.footer}>
                {isLogin ? (
                    <p style={styles.switchText}>
                        아직 계정이 없으신가요?{' '}
                        <span 
                            onClick={() => handleModeSwitch(false)} 
                            style={styles.switchLink}
                        >
                            회원가입
                        </span>
                    </p>
                ) : (
                    <p style={styles.switchText}>
                        이미 계정이 있으신가요?{' '}
                        <span 
                            onClick={() => handleModeSwitch(true)} 
                            style={styles.switchLink}
                        >
                            로그인
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        background: 'rgba(20, 20, 20, 0.45)',
        backdropFilter: 'blur(16px)',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '100%',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        textAlign: 'center',
        boxSizing: 'border-box'
    },
    toggleContainer: {
        display: 'flex',
        marginBottom: '25px',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.08)',
        padding: '4px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    activeTab: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '15px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    inactiveTab: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
        transition: 'all 0.3s ease'
    },
    title: { 
        marginBottom: '25px', 
        fontSize: '22px', 
        fontWeight: '700',
        background: 'linear-gradient(135deg, #ffffff 40%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: {
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.06)',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    },
    button: {
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
        marginTop: '10px'
    },
    message: { 
        marginTop: '18px', 
        fontWeight: '600', 
        fontSize: '14px',
        padding: '10px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.05)'
    },
    footer: {
        marginTop: '25px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)'
    },
    switchText: {
        margin: 0
    },
    switchLink: {
        color: '#a855f7',
        cursor: 'pointer',
        fontWeight: '700',
        textDecoration: 'underline',
        marginLeft: '5px'
    }
};

export default SignUp;