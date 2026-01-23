import React, { useEffect } from 'react'; // useState는 이제 필요 없어서 뺌
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ★ 중요: 여기선 컴포넌트를 그리지 않고 '이동'만 시키므로 임포트 다 삭제해도 됩니다.
// import Admin from './Admin';
// import Mentee from './Mentee';
// import Mento from './Mento';

const MyPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberType = async () => {
            const token = localStorage.getItem('accessToken');

            // if (!token) {
            //    alert("로그인이 필요합니다.");
            //    navigate('/login');
            //    return;
            // }

            try {
                // const response = await axios.get('/api/mypage/member-type', {
                //     headers: {
                //         'Authorization': `Bearer ${token}`,
                //         'Content-Type': 'application/json'
                //     }
                // });

                // ★ [핵심 변경] state에 저장(setMbType)하지 말고, 바로 주소를 쏴버립니다.
                // const type = response.data; 
                const type = 2; // 테스트용 하드코딩 (1: 멘티)

                if (type === 0) {
                    navigate('/admin'); // 관리자 페이지로 이동
                } else if (type === 1) {
                    navigate('/mentee'); // ★ /mentee로 이동 -> App.js가 감지 -> MenteeHome 자동 노출!
                } else if (type === 2) {
                    navigate('/mento'); // 멘토 페이지로 이동
                } else {
                    alert("회원 정보가 올바르지 않습니다.");
                    navigate('/');
                }

            } catch (error) {
                console.error("오류 발생:", error);
                // navigate('/login');
            }
        };

        fetchMemberType();
    }, [navigate]);

    // 이동하는 아주 짧은 순간에 보여질 화면
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>
            사용자 권한 확인 중입니다... 🚀
        </div>
    );
};

export default MyPage;