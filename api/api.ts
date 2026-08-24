export interface Consultation {
  id: number;
  type: string;
  date: string;
  slot: string;
  counselor?: string;
  counselorComment?: string;
  myMemo?: string;
}

export interface UserProfileData {
  name: string;
  studentId: string;
  reservations: Consultation[];
  history: Consultation[];
}

// Mockdata
export const fetchUserProfile = async (): Promise<UserProfileData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "홍길동",
        studentId: "0201",
        reservations: [
          { id: 1, type: "진로상담", date: "2026.06.25", slot: "7교시"},
          { id: 2, type: "진로상담", date: "2026.06.13", slot: "7교시" },
          { id: 3, type: "진로상담", date: "2026.06.14", slot: "7교시" },
          { id: 4, type: "진로상담", date: "2026.06.15", slot: "7교시", counselor: "OOO 선생님" },
          { id: 5, type: "진로상담", date: "2026.06.23", slot: "7교시", counselor: "OOO 선생님" },
        ],
        history: [
          { id: 1, type: "진로상담", date: "2026.08.20", slot: "7교시", counselor: "OOO 선생님", counselorComment: "상담 내용", myMemo: "" },
          { id: 2, type: "진로상담", date: "2026.08.20", slot: "7교시", counselor: "OOO 선생님", counselorComment: "상담 내용", myMemo: "" },
          { id: 3, type: "진로상담", date: "2026.08.20", slot: "7교시", counselor: "OOO 선생님", counselorComment: "상담 내용", myMemo: "" },
          { id: 4, type: "진로상담", date: "2026.08.20", slot: "7교시", counselor: "OOO 선생님", counselorComment: "상담 내용", myMemo: "" },
          { id: 5, type: "진로상담", date: "2026.08.20", slot: "7교시", counselor: "OOO 선생님", counselorComment: "상담 내용", myMemo: "" },
        ],
      });
    }, 500); 
  });
};

export const deleteReservation = async (reservationId: number): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`ID ${reservationId} 항목이 DB에서 삭제되었습니다.`);
      resolve({ success: true });
    }, 500); 
  });
};

export const fetchConsultationDetail = async (consultationId: number): Promise<Consultation | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // history 데이터에서 해당 ID의 상담 정보를 찾아서 반환
      const mockHistory: Consultation[] = [
        { id: 1, type: "일반상담", date: "2026.12.20", slot: "6교시"},
        { id: 2, type: "진로상담", date: "2026.08.20", slot: "7교시"},
        { id: 3, type: "진로상담", date: "2026.08.20", slot: "7교시"},
        { id: 4, type: "진로상담", date: "2026.08.20", slot: "7교시"},
        { id: 5, type: "진로상담", date: "2026.08.20", slot: "7교시"},
        { id: 6, type: "진로상담", date: "2026.08.20", slot: "7교시"},
      ];
      
      const consultation = mockHistory.find(item => item.id === consultationId);
      resolve(consultation || null);
    }, 500);
  });
};