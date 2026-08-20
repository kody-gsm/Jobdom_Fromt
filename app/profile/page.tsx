'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeaderTwo, Modal } from '../components/organisms';
import { fetchUserProfile, UserProfileData, deleteReservation } from '../../api/api';

export default function Profile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [Loading, setLoading] = useState(true);
  const [ModalOpen, setModalOpen] = useState(false);
  const [HistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [detailsModalOpen, setdetailsModalOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [targetReservationId, setTargetReservationId] = useState<number | null>(null);

  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchUserProfile();
      setUserData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const openCancelConfirm = (reservationId: number) => {
    setTargetReservationId(reservationId);
    setCancelConfirmOpen(true);
  };

  const handleCancelExecute = async () => {
    if (targetReservationId === null) return;
    try {
      await deleteReservation(targetReservationId);
      setUserData(prevData => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          reservations: prevData.reservations.filter(item => item.id !== targetReservationId),
          history: prevData.history.filter(item => item.id !== targetReservationId)
        };
      });
      setCancelConfirmOpen(false);
      setTargetReservationId(null);
    } catch (error) {
      alert("취소 중 오류가 발생했습니다.");
    }
  };

  const openDetailsModal = (historyId: number) => {
    setSelectedHistoryId(historyId);
    const targetHistory = userData?.history.find((item) => item.id === historyId);
    setMemoInput(targetHistory?.myMemo || '');
    setIsEditingMemo(false);
    setHistoryModalOpen(false);
    setdetailsModalOpen(true);
  };

  const handleSaveMemo = async (historyId: number) => {
    try {
      setUserData(prevData => {
        if (!prevData) return prevData;
        const updatedHistory = prevData.history.map((historyItem) =>
          historyItem.id === historyId ? { ...historyItem, myMemo: memoInput } : historyItem
        );
        return { ...prevData, history: updatedHistory };
      });
      setIsEditingMemo(false);
    } catch (error) {
      alert("메모 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col items-center pb-20">
      <HeaderTwo />

      <main className="w-full max-w-[550px] px-6 mt-10 flex flex-col gap-6">
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-28 bg-[#08D35A]"></div>
          <div className="relative flex flex-col items-center pb-8">
            <div className="w-28 h-28 bg-[#E8FFF2] rounded-full border-4 border-white flex items-center justify-center -mt-14 shadow-md overflow-hidden font-bold text-gray-300">
              <Image src="/profileIcon.svg" alt="profile" width={45} height={45} />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold text-gray-800">{userData?.name}</h1>
              <p className="mt-1 text-gray-400 text-lg font-medium">{userData?.studentId}</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image src="/Iconbg.svg" alt="bg" width={40} height={40} className="absolute inset-0" />
                <Image src="/date.svg" alt="icon" width={24} height={24} className="relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">예약 현황</h3>
            </div>
            <button onClick={() => setModalOpen(true)} className="text-sm font-bold text-[#08D35A] cursor-pointer">상세보기</button>
          </div>
          <div className="flex flex-col gap-3">
            {!userData || userData.reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 animate-fade-in">
                <span className="text-[#999999] text-sm font-medium tracking-tight">
                  예약된 상담이 없습니다
                </span>
              </div>
            ) : (
              userData.reservations.slice(0, 2).map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-[#F8F8F8] p-4 rounded-xl font-bold text-gray-700">
                  <span>{item.type}</span>
                  <span className="text-gray-400 text-sm">{item.date} / {item.slot}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image src="/Iconbg.svg" alt="bg" width={40} height={40} className="absolute inset-0" />
                <Image src="/timeIcon.svg" alt="icon" width={24} height={24} className="relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">기록</h3>
            </div>
            <button onClick={() => setHistoryModalOpen(true)} className="text-sm font-bold text-[#08D35A] cursor-pointer">상세보기</button>
          </div>
          <div className="flex flex-col gap-3">
            {userData?.history.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-[#F8F8F8] p-4 rounded-xl font-bold text-gray-700">
                <span>{item.type}</span>
                <span className="text-gray-400 text-sm">{item.date} / {item.slot}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Modal isOpen={ModalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col w-[500px] h-[480px] px-4">
          <h2 className="text-2xl md:text-2xl font-bold text-black mb-8 mt-5 px-4 pt-2">예약 현황</h2>
        
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-2 custom-scrollbar">
            {!userData || userData.reservations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium text-md pb-12">
                예약된 상담이 없습니다.
              </div>
            ) : (
              userData.reservations.map((item) => (
                <div key={item.id} className="bg-[#F6F7F9] p-3 rounded-lg shrink-0">
                  <div className="flex justify-between items-start">
                    <span className="text-medium font-medium text-gray-800">{item.type}</span>
                    <span className="text-gray-500 font-medium text-sm">{item.date} / {item.slot}</span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button onClick={() => openCancelConfirm(item.id)} className="text-[#C84A4A] text-sm font-medium cursor-pointer">예약 취소</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-auto pt-4 flex flex-col items-center gap-3">
            <button 
              onClick={() => setModalOpen(false)}
              className="w-full bg-[#02C551] text-white py-2 rounded-lg text-xl font-bold active:scale-95 transition-transform cursor-pointer">
              닫기
            </button>
            <p className="text-gray-400 text-xs font-medium">* 예약취소는 1시간 전부터 불가능합니다</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={HistoryModalOpen} onClose={() => setHistoryModalOpen(false)}>
        <div className="flex flex-col w-[500px] h-[480px] px-4">
          <h2 className="text-2xl md:text-2xl font-bold text-black mb-8 mt-5 px-4 pt-2">상담 기록</h2>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-2 custom-scrollbar">
            {userData?.history.map((item) => (
              <div key={item.id} className="bg-[#F6F7F9] p-3 rounded-lg shrink-0">
                <div className="flex justify-between items-start">
                  <span className="text-medium font-medium text-gray-800">{item.type}</span>
                  <span className="text-gray-500 font-medium text-sm">{item.date} / {item.slot}</span>
                </div>
                <div className="flex justify-end mt-1">
                  <button onClick={() => openDetailsModal(item.id)} className="text-[#08D35A] text-sm font-medium cursor-pointer">자세히 보기</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button 
              onClick={() => setHistoryModalOpen(false)}
              className="w-full bg-[#02C551] text-white py-2 rounded-lg text-xl font-bold active:scale-95 transition-transform cursor-pointer">
              닫기  
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={detailsModalOpen} onClose={() => { setdetailsModalOpen(false); setIsEditingMemo(false); }}>
        <div className="flex flex-col w-[500px] h-[480px] px-4">
          <h2 className="text-2xl md:text-2xl font-bold text-black mb-3 mt-3 px-4 pt-2">상담 상세기록</h2>
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-2 custom-scrollbar">
            {userData?.history.filter((item) => item.id === selectedHistoryId).map((item) => (
              <div key={item.id} className="flex flex-col gap-4"> 
                <div className="bg-[#E8FFF2] p-4 rounded-lg mt-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-sm text-gray-500">상담 담당</span>
                      <p className="font-md text-md mt-1">{item.counselor}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">상담 일시</span>
                      <p className="font-md text-md mt-1">{item.date}</p>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium -mt-2">상담 내용</span>
                <div className="bg-[#F8F8F8] p-4 pt-2 rounded-lg -mt-4">
                  <p className="font-md text-md" style={{ height: '75px', overflow: 'auto' }}>
                    {item.counselorComment}
                  </p>
                </div>

                <div className="flex justify-between items-center -mb-2">
                  <p className="text-sm font-medium">나의 메모</p>
                  {!isEditingMemo ? (
                    <button
                      onClick={() => setIsEditingMemo(true)}
                      className="flex items-center text-sm font-medium text-[#02C551] cursor-pointer gap-1"
                    >
                      <Image src="/Write.svg" alt="write" width={16} height={16} />
                      {item.myMemo ? '수정하기' : '작성하기'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditingMemo(false);
                          setMemoInput(item.myMemo || '');
                        }}
                        className="text-sm text-gray-400 font-medium cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSaveMemo(item.id)}
                        className="text-sm text-[#02C551] font-bold cursor-pointer"
                      >
                        저장
                      </button>
                    </div>
                  )}
                </div>

                {isEditingMemo ? (
                  <textarea
                    value={memoInput}
                    onChange={(e) => setMemoInput(e.target.value)}
                    placeholder="메모를 입력하세요..."
                    className="w-full h-[85px] p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#02C551] resize-none bg-white"
                  />
                ) : (
                  <div className="bg-[#F8F8F8] p-4 pt-2 rounded-lg -mt-2">
                    <p className="font-md" style={{ height: '75px', overflow: 'auto' }}>
                      {item.myMemo || "아직 작성된 메모가 없습니다"}
                    </p>
                  </div>
                )}
              </div> 
            ))}
          </div>
          <div className="mt-auto pt-4">
            <button 
              onClick={() => { setdetailsModalOpen(false); setIsEditingMemo(false); }}
              className="w-full bg-[#02C551] text-white py-2 rounded-lg text-xl font-bold active:scale-95 transition-transform cursor-pointer">
              닫기  
            </button>
          </div>
        </div>
      </Modal>

      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setCancelConfirmOpen(false)} />
          
          <div className="relative bg-white w-full max-w-[340px] rounded-[24px] shadow-2xl p-6 z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center my-4">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                정말 예약을 취소하시는 건가요?
              </h3>
            </div>
            
            <div className="flex w-full gap-3 mt-4">
              <button 
                onClick={() => setCancelConfirmOpen(false)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                아니요
              </button>
              <button 
                onClick={handleCancelExecute}
                className="flex-1 bg-[#02C551] hover:bg-[#4ca84e] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}