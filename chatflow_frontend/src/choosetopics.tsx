import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./choosetopics.css";

interface Topic {
    id: number;
    name: string;
    slug: string;
}

const BASE_URL = "https://massagesbox.ir/massage";

const ChooseTopics = () => {

    const navigate = useNavigate();
    const { slug } = useParams()
    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicName, setTopicName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if (!slug) {
            return;
        }

        let cancelled = false;

        const getTopics = async () => {

            try {

                setLoading(true);
                setError(null);

                const res = await axios.get<Topic[]>(
                    `${BASE_URL}/${encodeURIComponent(slug)}/topics/`,
                    { withCredentials: true }
                );

                if (!cancelled) {
                    setTopics(res.data);
                }

            } catch (error) {

                if (!cancelled) {
                    setError("دریافت تاپیک‌ها انجام نشد");
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }
        };

        getTopics();

        return () => {
            cancelled = true;
        };

    }, [slug]);

    const createTopic = async (
        e?: React.FormEvent<HTMLFormElement>
    ) => {

        e?.preventDefault();

        const name = topicName.trim();

        if (!name || creating || !slug) {
            return;
        }

        try {

            setCreating(true);
            setError(null);

            const res = await axios.post<Topic>(
                `${BASE_URL}/${encodeURIComponent(slug)}/topics/create/`,
                {
                    name: name
                },
                { withCredentials: true }
            );

            setTopicName("");

            navigate(
                `/topics/${slug}/${res.data.slug}`
            );

        } catch (error) {

            setError("ساخت تاپیک انجام نشد، دوباره تلاش کن");

        } finally {

            setCreating(false);

        }
    };

    return (
        <main className="topics-page">

            <section className="topics-container">

                <div className="topics-header">

                    <span className="topics-badge">
                        MESSAGESBOX
                    </span>

                    <h1>
                        موضوع گفتگوت رو انتخاب کن
                    </h1>

                    <p>
                        یک موضوع را انتخاب کن یا موضوع جدیدی
                        برای گفتگو بساز.
                    </p>

                </div>

                <div className="create-topic">

                    <label htmlFor="topic">
                        اضافه کردن تاپیک
                    </label>

                    <div className="topic-input">

                        <form onSubmit={createTopic}>

                            <input
                                id="topic"
                                type="text"
                                value={topicName}
                                maxLength={100}
                                onChange={(e) =>
                                    setTopicName(e.target.value)
                                }
                                placeholder="تاپیک خود را بنویسید..."
                            />

                            <button
                                type="submit"
                                disabled={
                                    creating ||
                                    !topicName.trim()
                                }
                            >
                                {creating ? "در حال ساخت..." : "افزودن"}
                            </button>

                        </form>

                    </div>

                </div>

                <div className="topics-section">

                    <h2>
                        تاپیک‌های این روم
                    </h2>

                    {error && (
                        <div className="no-topics">
                            {error}
                        </div>
                    )}

                    {loading ? (

                        <div className="topics-loading">
                            در حال دریافت تاپیک‌ها...
                        </div>

                    ) : topics.length === 0 && !error ? (

                        <div className="no-topics">
                            هنوز تاپیکی ساخته نشده.
                            <br />
                            اولین تاپیک را تو بساز!
                        </div>

                    ) : (

                        <div className="topics-list">

                            {topics.map((topic) => (

                                <button
                                    className="topic-card"
                                    key={topic.id}
                                    onClick={() =>
                                        navigate(`/topics/${slug}/${topic.slug}`)
                                    }
                                >

                                    <div className="topic-card-content">

                                        <span className="topic-icon">
                                            #
                                        </span>

                                        <div>

                                            <h3>
                                                {topic.name}
                                            </h3>

                                            <span>
                                                ورود به گفتگو
                                            </span>

                                        </div>

                                    </div>

                                    <span className="topic-arrow">
                                        ←
                                    </span>

                                </button>

                            ))}

                        </div>

                    )}

                </div>

            </section>

        </main>
    );
};

export default ChooseTopics;
