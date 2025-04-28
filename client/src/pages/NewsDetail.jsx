import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/mainLayout";
import Breadcrumb2 from "../components/Breadcrumb2";
import CommentForm from "../components/CommentForm";
import dog1 from "../assets/images/dog1.jpg";
import dog2 from "../assets/images/dog2.jpg";
import NotFoundPage from "./NotFoundPage";

const articles = [
  {
    id: 1,
    title: "Cách xử lý khi chó mèo bị tiêu chảy?",
    slug: "cach-xu-ly-khi-cho-meo-bi-tieu-chay",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    content: `Trong cuộc sống hằng ngày thì con người cũng như động vật việc hệ tiêu hóa gặp vấn đề là việc khá thường xuyên xảy ra...`,
  },
  {
    id: 2,
    title: "Cấp cứu chó bị sốc nhiệt tại nhà",
    slug: "cap-cuu-cho-bi-soc-nhiet-tai-nha",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog2,
    content: `Khi quyết định nuôi thú cưng, đặc biệt là chó, bạn cần tìm hiểu những thông tin cơ bản về cách chăm sóc...`,
  },
];

const NewsDetail = () => {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  // Cuộn lên đầu trang khi vào bài viết mới
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <MainLayout>
        <Breadcrumb2
        links={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/blogs/news" },
          { label: "Bài viết không tồn tại", href: `` },
        ]}
        banner={null}
      />
        <NotFoundPage/>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb2
        links={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/blogs/news" },
          { label: article.title, href: `/blogs/news/${article.slug}` },
        ]}
        banner={null}
      />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800">{article.title}</h1>
        <p className="text-gray-500 mt-2">📅 {article.date} • Đăng bởi: <strong>{article.author}</strong></p>
        <img src={article.image} alt={article.title} className="w-full h-80 object-cover rounded-lg mt-4" />
        <div className="text-gray-700 mt-6 leading-relaxed">{article.content}</div>

        <CommentForm/>
      </div>

    </MainLayout>
  );
};

export default NewsDetail;
