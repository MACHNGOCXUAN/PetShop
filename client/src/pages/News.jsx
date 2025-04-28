import React from "react";
import MainLayout from "../layout/mainLayout";
import Breadcrumb2 from "../components/Breadcrumb2";
import dog1 from "../assets/images/dog1.jpg";
import dog2 from "../assets/images/dog2.jpg";
import { Link } from "react-router-dom";

const links = [
  { label: "Trang chủ", href: "/" },
  { label: "Tin tức", href: "/blogs/news" },
];

const articles = [
  {
    id: 1,
    title: "Cách xử lý khi chó mèo bị tiêu chảy?",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    slug: "cach-xu-ly-khi-cho-meo-bi-tieu-chay",
    excerpt:
      "Trong cuộc sống hằng ngày thì con người cũng như động vật việc hệ tiêu hóa gặp vấn đề...",
  },
  {
    id: 2,
    title: "Cấp cứu chó bị sốc nhiệt tại nhà",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog2,
    slug: "cap-cuu-cho-bi-soc-nhiet-tai-nha",
    excerpt:
      "Khi quyết định nuôi thú cưng, đặc biệt là chó, bạn cần tìm hiểu những thông tin cơ bản...",
  },
  {
    id: 3,
    title: "Có thể bạn chưa biết 'Những lợi ích của việc ngủ với thú cưng'",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    slug: "nhung-loi-ich-cua-viec-ngu-voi-thu-cung",
    excerpt:
      "Theo một nghiên cứu của Đại học Canisius, New York dựa trên việc khảo sát gần 1.000 người...",
  },
];


const NewsList = () => {
  return (
    <MainLayout>
       {/* Breadcrumb + Banner */}
       <Breadcrumb2 links={links} banner={null} />

      <div className="max-w-6xl mx-auto p-6">
        

        <div className="mt-10 relative w-full">
        <div className="flex">

          <span className="bg-brown text-white px-4 py-2 rounded-md font-semibold relative z-10 transform skew-x-10">
            TIN TỨC
          </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full border-b-2 border-gray-200 mt-4"></div>

        </div>

        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/blogs/news/${article.slug}`}
            className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer block"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-gray-500 text-sm">
                📅 {article.date} • Đăng bởi:{" "}
                <strong>{article.author}</strong>
              </p>
              <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
              <p className="text-gray-600 mt-2">{article.excerpt}</p>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default NewsList;
