import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ExportToCsv } from "export-to-csv";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    client: "",
    owner: "",
    status: "진행중",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeView, setActiveView] = useState("calendar");
  const [sortKey, setSortKey] = useState("date");

  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) return alert("모든 필드를 입력해주세요!");
    if (!isValidDate(formData.date)) return alert("날짜 형식이 잘못됐습니다 (예: 2025-04-08)");

    const newEvent = {
      ...formData,
      completed: false,
    };
    setEvents([...events, newEvent]);
    setFormData({ title: "", date: "", client: "", owner: "", status: "진행중" });
  };

  const handleDelete = (index) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

  const toggleComplete = (index) => {
    const updated = [...events];
    updated[index].completed = !updated[index].completed;
    setEvents(updated);
  };

  const exportCSV = () => {
    const csv = new ExportToCsv({ filename: "요청리스트" });
    csv.generateCsv(events);
  };

  const today = new Date();
  const isDueSoon = (dateStr) => {
    const target = new Date(dateStr);
    const diff = (target - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 1;
  };

  const filteredEvents = events
    .filter((event) => {
      const matchSearch = `${event.title} ${event.client} ${event.owner}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchFilter =
        filterStatus === "all" ||
        (filterStatus === "completed" && event.completed) ||
        (filterStatus === "incomplete" && !event.completed);

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortKey === "date") return new Date(a.date) - new Date(b.date);
      if (sortKey === "client") return a.client.localeCompare(b.client);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const totalCount = filteredEvents.length;
  const completedCount = filteredEvents.filter(e => e.completed).length;
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-4 space-y-6">
      {/* 뷰 선택 탭 */}
      <div className="flex gap-4 mb-4">
        {['calendar', 'all', 'status'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-3 py-1 rounded ${activeView === view ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {view === 'calendar' ? '📅 Calendar View' : view === 'all' ? '📋 All Tasks' : '✅ By Status'}
          </button>
        ))}
      </div>

      {/* 입력 폼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input type="date" className="border p-2 w-full" name="date" value={formData.date} onChange={handleInputChange} />
          <input className="border p-2 w-full" placeholder="거래처 이름" name="client" value={formData.client} onChange={handleInputChange} />
          <input className="border p-2 w-full" placeholder="담당자 이름" name="owner" value={formData.owner} onChange={handleInputChange} />
          <input className="border p-2 w-full" placeholder="요청 내용" name="title" value={formData.title} onChange={handleInputChange} />
          <select name="status" value={formData.status} onChange={handleInputChange} className="border p-2 w-full">
            <option>진행중</option>
            <option>대기</option>
            <option>보류</option>
            <option>완료</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddEvent}>요청 추가</button>
        </div>
        <div>
          {activeView === "calendar" && (
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events.map((e) => ({ title: `${e.title} (${e.client}/${e.owner})`, date: e.date }))}
            />
          )}
        </div>
      </div>

      {activeView !== "calendar" && (
        <>
          {/* 필터 & 정렬 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setFilterStatus("all")} className={`px-3 py-1 rounded ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>전체</button>
            <button onClick={() => setFilterStatus("completed")} className={`px-3 py-1 rounded ${filterStatus === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>완료</button>
            <button onClick={() => setFilterStatus("incomplete")} className={`px-3 py-1 rounded ${filterStatus === "incomplete" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>미완료</button>
            <select onChange={(e) => setSortKey(e.target.value)} className="border px-2">
              <option value="date">날짜순</option>
              <option value="client">거래처순</option>
              <option value="status">상태순</option>
            </select>
            <input placeholder="검색어 입력" className="border p-2 flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded ml-auto">CSV 다운로드</button>
          </div>

          {/* 통계 */}
          <div className="bg-gray-100 p-4 rounded shadow text-center">
            <p className="text-lg font-semibold">총 요청 수: {totalCount}건</p>
            <p className="text-green-700 font-medium">완료: {completedCount}건</p>
            <p className="text-blue-600 font-medium">진행률: {completionRate}%</p>
          </div>

          {/* 테이블 */}
          <table className="w-full mt-4 table-auto border border-gray-600">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border px-4 py-2">날짜</th>
                <th className="border px-4 py-2">거래처</th>
                <th className="border px-4 py-2">담당자</th>
                <th className="border px-4 py-2">요청 내용</th>
                <th className="border px-4 py-2">상태</th>
                <th className="border px-4 py-2">완료</th>
                <th className="border px-4 py-2">삭제</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, idx) => {
                const isUrgent = isDueSoon(event.date) && !event.completed;
                return (
                  <tr key={idx} className={`text-center ${isUrgent ? "bg-red-100" : ""}`}>
                    <td className="border px-4 py-2">{event.date}</td>
                    <td className="border px-4 py-2">{event.client}</td>
                    <td className="border px-4 py-2">{event.owner}</td>
                    <td className="border px-4 py-2">{event.title}</td>
                    <td className="border px-4 py-2">{event.status}</td>
                    <td className="border px-4 py-2">
                      <input type="checkbox" checked={event.completed} onChange={() => toggleComplete(idx)} />
                    </td>
                    <td className="border px-4 py-2">
                      <button className="text-red-500 hover:underline" onClick={() => handleDelete(idx)}>삭제</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
