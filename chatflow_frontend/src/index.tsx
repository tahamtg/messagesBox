import { useState } from "react";
import axios from "axios";
import "./index.css";

interface SearchResult {
  title: string;
}

const Index = () => {
  const [search, setSearch] = useState<string>("");
  const [dataSearch, setDataSearch] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const searching = async () => {
    if (!search.trim()) {
      setDataSearch([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await axios.get(
        "https://massagesbox.ir/massage/searching/",
        {
          params: {
            search: search,
          },
        }
      );

      setDataSearch(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-page">
      <section className="home-content">

        <span className="home-badge">
          MESSAGESBOX
        </span>

        <h1>
          جایی برای گفتگو،<br />
          <span>بدون شلوغی.</span>
        </h1>

        <p className="home-description">
          MessagesBox فضایی ساده و سریع برای ارتباط و گفتگوست؛
          جایی که می‌توانی وارد یک اتاق شوی، موضوع موردنظرت را انتخاب کنی
          و با دیگران گفتگو کنی.
        </p>

        <div className="topic-box">
          <label htmlFor="topic">
            موضوع گفتگو
          </label>

          <div className="topic-input-wrapper">
            <input
              id="topic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="مثلاً برنامه‌نویسی، هوش مصنوعی..."
            />

            <button type="button" onClick={searching}>
              ورود
            </button>
          </div>
        </div>

        <section className="topic-results">

          {loading && (
            <p>در حال جستجو...</p>
          )}

          {!loading && searched && dataSearch.length === 0 && (
            <p>چیزی پیدا نشد!</p>
          )}

          {!loading && dataSearch.length > 0 && (
            dataSearch.map((item, index) => (
              <div className="topic-title" key={index}>
                {item.title}
              </div>
            ))
          )}

        </section>

        <p className="home-footer">
          یک موضوع انتخاب کن و گفتگو را شروع کن.
        </p>

      </section>
    </main>
  );
};

export default Index;