import React, { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient";

const QnA = ({ leId, currentMemberId }) => {
  const [qnaList, setQnaList] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const [answerTexts, setAnswerTexts] = useState({});

  const fetchQnAs = async () => {
    try {
      // ★ /api 제거: apiClient에 이미 설정되어 있음
      const response = await apiClient.get(`/lectures/qna/${leId}`);
      setQnaList(response.data);
    } catch (error) {
      console.error("로딩 실패:", error);
    }
  };

  useEffect(() => { if (leId) fetchQnAs(); }, [leId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ★ /api 제거
      await apiClient.post("/lectures/qna", { 
        ...newQuestion, le_id: leId, mb_id: currentMemberId 
      });
      alert("질문 등록 완료");
      setIsWriting(false);
      setNewQuestion({ title: "", content: "" }); // 입력창 초기화
      fetchQnAs();
    } catch (error) { 
      console.error("등록 실패 상세:", error.response);
      alert("질문 등록에 실패했습니다."); 
    }
  };

  const handleAnswerSubmit = async (qnaId) => {
    const text = answerTexts[qnaId];
    if (!text?.trim()) return alert("내용을 입력해주세요.");
    try {
      // ★ /api 제거
      await apiClient.put("/lectures/qna/answer", {
        qna_id: qnaId,
        answer: text,
        ans_mb_id: currentMemberId
      });
      alert("답변 등록 완료");
      setAnswerTexts({ ...answerTexts, [qnaId]: "" });
      fetchQnAs();
    } catch (error) { 
      console.error("답변 실패 상세 (403 확인용):", error.response);
      alert("답변 권한이 없거나 등록에 실패했습니다."); 
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  const styles = {
    container: { maxWidth: "850px", margin: "30px auto", fontFamily: '"Inter", sans-serif' },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px" },
    writeBtn: { backgroundColor: "#FF6B35", color: "white", border: "none", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontWeight: "bold" },
    questionCard: { backgroundColor: "#F8F9FA", padding: "25px", borderRadius: "12px", marginBottom: "10px", border: "1px solid #E9ECEF" },
    answerCard: { backgroundColor: "#FFF5F2", padding: "25px", borderRadius: "12px", marginLeft: "50px", marginBottom: "30px", borderLeft: "5px solid #FF6B35" },
    answerInputBox: { marginLeft: "50px", marginTop: "10px", padding: "15px", border: "1px dashed #FF6B35", borderRadius: "8px", background: "#fff9f7" },
    textarea: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", height: "100px", resize: "none", boxSizing: "border-box" },
    ansSubmitBtn: { backgroundColor: "#333", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", marginTop: "10px", float: "right" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontSize: "24px" }}>Q&A</h2>
        <button style={styles.writeBtn} onClick={() => setIsWriting(!isWriting)}>{isWriting ? "취소" : "Q&A 작성"}</button>
      </div>

      {isWriting && (
        <form style={{ marginBottom: "20px" }} onSubmit={handleSubmit}>
          <input style={{ width: "100%", padding: "10px", marginBottom: "10px" }} type="text" placeholder="제목" value={newQuestion.title} onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })} />
          <textarea style={styles.textarea} placeholder="질문을 입력하세요" value={newQuestion.content} onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })} />
          <button type="submit" style={styles.writeBtn}>등록하기</button>
        </form>
      )}

      {qnaList.map((qna) => {
        const isMentor = String(currentMemberId) === String(qna.mentor_id);

        return (
          <div key={qna.qna_id}>
            <div style={styles.questionCard}>
              <div style={{ marginBottom: "10px", fontSize: "14px" }}>{qna.authorNickname} | {formatDate(qna.created_at)}</div>
              <h4>{qna.title}</h4>
              <p>{qna.content}</p>
            </div>

            {qna.answer ? (
              <div style={styles.answerCard}>
                <div style={{ fontWeight: "bold", color: "#FF6B35" }}>Mentor 답변</div>
                <p>{qna.answer}</p>
              </div>
            ) : (
              isMentor && (
                <div style={styles.answerInputBox}>
                  <textarea 
                    style={styles.textarea}
                    placeholder="멘토님, 답변을 입력하세요."
                    value={answerTexts[qna.qna_id] || ""}
                    onChange={(e) => setAnswerTexts({ ...answerTexts, [qna.qna_id]: e.target.value })}
                  />
                  <div style={{ height: "40px" }}>
                    <button style={styles.ansSubmitBtn} onClick={() => handleAnswerSubmit(qna.qna_id)}>답변 등록</button>
                  </div>
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QnA;