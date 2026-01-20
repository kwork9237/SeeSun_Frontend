import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 사용

// 컴포넌트 임포트 (경로에 맞게 수정해주세요)
import Admin from './Admin';
import Mentee from './Mentee';
import Mento from './Mento';

const MyPage = () => {
    const [mbType, setMbType] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberType = async () => {
            // 1. 저장된 JWT 토큰 가져오기 (로그인 시 localStorage에 'accessToken'이란 이름으로 저장했다고 가정)
            const token = localStorage.getItem('accessToken');

            // 토큰이 없으면 로그인 페이지로 튕겨내기
            if (!token) {
                alert("로그인이 필요합니다.");
                navigate('/login');
                return;
            }

            try {
                // 2. API 호출 시 헤더에 토큰 포함
                const response = await axios.get('/api/mypage/member-type', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // 중요: Bearer 공백 토큰
                        'Content-Type': 'application/json'
                    }
                });

                // 3. 성공 시 받아온 타입(0, 1, 2) 저장
                setMbType(response.data);

            } catch (error) {
                console.error("인증 실패 또는 데이터 로드 오류:", error);
                
                // 4. 토큰 만료 또는 위조된 경우 (401, 403 에러) 처리
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    alert("인증이 만료되었습니다. 다시 로그인해주세요.");
                    localStorage.removeItem('accessToken'); // 만료된 토큰 삭제
                    navigate('/login');
                } else {
                    alert("정보를 불러오는데 실패했습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMemberType();
    }, [navigate]);

    // 로딩 중 화면
    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // 사용자 타입에 따른 렌더링 분기
    const renderContent = () => {
        switch (mbType) {
            case 0:
                return <Admin />;
            case 1:
                return <Mentee />;
            case 2:
                return <Mento />;
            default:
                // 예외 처리: DB에 0,1,2 이외의 값이 들어있거나 오류가 났을 때
                return <div>잘못된 접근이거나 알 수 없는 회원 타입입니다.</div>;
        }
    };

    return (
        <div className="mypage-wrapper">
            {/* 공통 레이아웃 (헤더 등)이 있다면 여기에 포함 */}
            {renderContent()}
        </div>
    );
};

export default MyPage;