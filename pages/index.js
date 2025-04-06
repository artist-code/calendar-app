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
  });
  const [searchTerm, setSearchTerm] = useState("");

  // 🔁 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem("events");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  // 💾 자동 저장
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const isValidDate = (date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) return alert("모든 필드를 입력해주세요!");
    if (!isValidDate(formData.date)) return alert("날짜 형식이 잘못됐습니다 (예: 2025-04-08)");

    const newEvent = {
      title: formData.title,
      date: formData.date,
      client: formData.client,
      owner: formData.owner,
    };
    setEvents([...events, newEvent]);
    setFormData({ title: "", date: "", client: "", owner: "" });
  };

  const handleDelete = (index) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

  const exportCSV = () => {
    const csv = new ExportToCsv({ filename: "요청리스트" });
    csv.generateCsv(events);
  };

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.client} ${event.owner}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-8">
      {/* 입력 폼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="요청 내용"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          <input
            type="date"
            className="border p-2 w-full"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
          <input
            className="border p-2 w-full"
            placeholder="거래처 이름"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
          />
          <input
            className="border p-2 w-full"
            placeholder="담당자 이름"
            name="owner"
            value={formData.owner}
            onChange={handleInputChange}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddEvent}
          >
            요청 추가
          </button>
        </div>

        <div>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map((e) => ({
              title: `${e.title} (${e.client}/${e.owner})`,
              date: e.date,
            }))}
          />
        </div>
      </div>

      {/* 요청 리스트 + 검색 + 다운로드 */}
      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <input
            className="border p-2 w-full max-w-md"
            placeholder="검색 (요청내용, 거래처, 담당자)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={exportCSV}
            className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            CSV 다운로드
          </button>
        </div>
        <table className="w-full table-auto border border-gray-600">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border px-4 py-2">요청 내용</th>
              <th className="border px-4 py-2">날짜</th>
              <th className="border px-4 py-2">거래처</th>
              <th className="border px-4 py-2">담당자</th>
              <th className="border px-4 py-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, idx) => (
              <tr key={idx} className="text-center">
                <td className="border px-4 py-2">{event.title}</td>
                <td className="border px-4 py-2">{event.date}</td>
                <td className="border px-4 py-2">{event.client}</td>
                <td className="border px-4 py-2">{event.owner}</td>
                <td className="border px-4 py-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(idx)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
