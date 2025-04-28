import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategory } from "../stores/catetorySlice";
import { Link } from "react-router-dom";
import { featchProductFilterProduct } from "../stores/productSlice";

const priceRanges = [
  "Giá dưới 20.000đ",
  "20.000đ - 50.000đ",
  "50.000đ - 100.000đ",
  "100.000đ - 200.000đ",
  "200.000đ - 300.000đ",
  "Giá trên 300.000đ",
];

const Filter = () => {
  const [selectedPrices, setSelectedPrices] = useState([]);
  const dispatch = useDispatch();
  const { allCategory } = useSelector(state => state.categories)
  const [priceFilter, setPriceFilter] = useState([])

  const handlePriceChange = (price) => {
    setSelectedPrices((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const parsePriceRange = (priceStr) => {
    if (priceStr.includes("dưới")) {
      const max = parseInt(priceStr.match(/\d+/g).join(""));
      return { min: 0, max };
    } else if (priceStr.includes("trên")) {
      const min = parseInt(priceStr.match(/\d+/g).join(""));
      return { min, max: Infinity };
    } else {
      const [minStr, maxStr] = priceStr.split(" - ");
      const min = parseInt(minStr.replace(/\D/g, ""));
      const max = parseInt(maxStr.replace(/\D/g, ""));
      return { min, max };
    }
  };

  const handleFilterSubmit = async () => {
    const parsedRanges = selectedPrices.map(parsePriceRange);
    dispatch(featchProductFilterProduct(parsedRanges))
  };

  useEffect(() => {
    dispatch(fetchAllCategory())
  }, [dispatch])

  return (
    <div className=" bg-white shadow-md">
      <div className="mb-4">
        <h4 className="bg-brown text-white px-3 py-2 font-semibold mb-5">DANH MỤC</h4>
        <div className="bg-white border rounded p-2 flex flex-col gap-2">
          {allCategory?.map((category, index) => (
            <div key={index} className="hover:text-[#e17100]">
              <Link to={`/categories/${category.slug}`}>{category.name}</Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="bg-brown text-white px-3 py-2 font-semibold my-5">KHOẢNG GIÁ</h4>
        <div className="bg-white border rounded p-2">
          {priceRanges.map((price, index) => (
            <label key={index} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                value={price}
                checked={selectedPrices.includes(price)}
                onChange={() => handlePriceChange(price)}
                className="accent-[#e17100]"
              />
              <span>{price}</span>
            </label>
          ))}
        </div>
      </div>
      <button onClick={handleFilterSubmit} className="bg-brown w-full mt-5 py-2 text-[20px] text-white font-bold cursor-pointer">Lọc</button>
    </div>
  );
};

export default Filter;