import "./index.css";

const Index = () => {
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
              type="text"
              placeholder="مثلاً برنامه‌نویسی، هوش مصنوعی..."
            />

            <button type="button">
              ورود
            </button>
          </div>
        </div>

        <p className="home-footer">
          یک موضوع انتخاب کن و گفتگو را شروع کن.
        </p>

      </section>
    </main>
  );
};

export default Index;