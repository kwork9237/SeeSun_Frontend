import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QnA = ({ leId, currentMemberId }) => {
    const [qnaList, setQnaList] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });

    // 1. Q&A 목록 가져오기
    const fetchQnAs = async () => {
        try {
            const response = await axios.get(`/api/lecture/qna/${leId}`);
            setQnaList(response.data);
        } catch (error) {
            console.error("Q&A 로딩 실패:", error);
        }
    };

    useEffect(() => {
        if (leId) fetchQnAs();
    }, [leId]);

    // 2. 질문 등록 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!newQuestion.title || !newQuestion.content) return alert("내용을 입력해주세요.");
        
        try {
            await axios.post('/api/lecture/qna', {
                ...newQuestion,
                leId: leId,
                mbId: currentMemberId // 백엔드 DTO mbId가 Long이므로 숫자형태여야 함
            });
            alert("질문이 등록되었습니다.");
            setNewQuestion({ title: '', content: '' });
            setIsWriting(false);
            fetchQnAs();
        } catch (error) {
            console.error("등록 에러:", error);
            alert("질문 등록에 실패했습니다.");
        }
    };

    // --- 인라인 스타일 정의 ---
    const styles = {
        container: { maxWidth: '850px', margin: '30px auto', fontFamily: '"Inter", sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' },
        writeBtn: { backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' },
        
        formBox: { background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
        input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
        textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', height: '100px', resize: 'none' },
        
        // 질문 카드 
        questionCard: { backgroundColor: '#F8F9FA', padding: '25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E9ECEF' },
        
        // 답변 카드 
        answerCard: { backgroundColor: '#FFF5F2', padding: '25px', borderRadius: '12px', marginLeft: '50px', marginBottom: '30px', borderLeft: '5px solid #FF6B35' },
        
        profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
        userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
        avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#CED4DA' },
        mentorAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FF6B35' },
        
        nickname: { fontWeight: 'bold', fontSize: '15px' },
        date: { color: '#ADB5BD', fontSize: '13px' },
        mentorBadge: { backgroundColor: '#FF6B35', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' },
        contentText: { margin: 0, color: '#495057', lineHeight: '1.6', fontSize: '15px' }
    };

    return (
        <div style={styles.container}>
            {/* 상단 헤더 */}
            <div style={styles.header}>
                <h2 style={{ fontSize: '24px', color: '#212529' }}>Q&A</h2>
                <button style={styles.writeBtn} onClick={() => setIsWriting(!isWriting)}>
                    {isWriting ? "취소" : "Q&A 작성"}
                </button>
            </div>

            {/* 질문 작성 폼 */}
            {isWriting && (
                <form style={styles.formBox} onSubmit={handleSubmit}>
                    <input 
                        style={styles.input}
                        type="text" 
                        placeholder="궁금한 점을 적어주세요."
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                    />
                    <textarea 
                        style={styles.textarea}
                        placeholder="내용을 상세히 적어주시면 멘토가 더 정확한 답변을 드릴 수 있습니다."
                        value={newQuestion.content}
                        onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                    />
                    <button type="submit" style={{ ...styles.writeBtn, width: '100px', alignSelf: 'flex-end' }}>등록하기</button>
                </form>
            )}

            {/* Q&A 리스트 영역 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {qnaList.length > 0 ? qnaList.map((qna) => (
                    <div key={qna.qnaId}>
                        {/* 멘티 질문 카드 */}
                        <div style={styles.questionCard}>
                            <div style={styles.profileRow}>
                                <div style={styles.userInfo}>
                                    <div style={styles.avatar}></div>
                                    <span style={styles.nickname}>{qna.authorNickname || "수강생"}</span>
                                </div>
                                <span style={styles.date}>{new Date(qna.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#212529' }}>{qna.title}</h4>
                            <p style={styles.contentText}>{qna.content}</p>
                        </div>

                        {/* 멘토 답변 카드 (답변이 있을 때만 노출) */}
                        {qna.answer && (
                            <div style={styles.answerCard}>
                                <div style={styles.profileRow}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.mentorAvatar}></div>
                                        <span style={styles.nickname}>
                                            {qna.mentorNickname || "강사님"} 
                                            <span style={styles.mentorBadge}>Mentor</span>
                                        </span>
                                    </div>
                                    <span style={styles.date}>{new Date(qna.modifiedAt || qna.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={styles.contentText}>{qna.answer}</p>
                            </div>
                        )}
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#ADB5BD' }}>
                        아직 질문이 없습니다. 질문을 남겨보세요!
                    </div>
                )}
            </div>
        </div>
    );
}

export default QnA;