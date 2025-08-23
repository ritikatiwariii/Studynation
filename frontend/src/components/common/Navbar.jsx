import { useEffect, useState, useRef } from "react";
import {
  AiOutlineMenu,
  AiOutlineShoppingCart,
  AiOutlineClose,
} from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";

import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../service/apiconnector";
import { categories } from "../../service/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../cors/Auth/ProfileDropdown";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data); // <-- This is important!
        console.log("Fetched categories:", res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  // console.log("sub links", subLinks)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks && subLinks.length ? (
                          <>
                            {subLinks?.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                key={i}
                              >
                                <p>{subLink.name}</p>
                              </Link>
                            ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {!token && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {!token && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>
        <button
          className="mr-2 rounded p-2 transition md:hidden hover:bg-richblack-700"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <AiOutlineClose fontSize={22} fill="#AFB2BF" />
          ) : (
            <AiOutlineMenu fontSize={22} fill="#AFB2BF" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[60] bg-richblack-900/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div
            ref={mobileMenuRef}
            className="fixed left-0 top-0 z-[70] flex h-full w-[78%] max-w-xs flex-col gap-4 overflow-y-auto bg-richblack-800/95 px-5 pb-10 pt-6 shadow-2xl ring-1 ring-richblack-700 animate-slide-in-left"
          >
            <div className="mb-4 flex items-center justify-between">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img
                  src={logo}
                  alt="Logo"
                  className="h-8 w-auto"
                  loading="lazy"
                />
              </Link>
              <button
                aria-label="Close navigation menu"
                className="rounded p-2 hover:bg-richblack-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AiOutlineClose fontSize={20} fill="#AFB2BF" />
              </button>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {NavbarLinks.map((link, index) => (
                <li key={index} className="">
                  {link.title === "Catalog" ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => setMobileCatalogOpen((p) => !p)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left font-medium transition ${
                          matchRoute("/catalog/:catalogName")
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        } hover:bg-richblack-700 focus:outline-none`}
                        aria-expanded={mobileCatalogOpen}
                      >
                        <span>{link.title}</span>
                        <BsChevronDown
                          className={`transition-transform ${
                            mobileCatalogOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                      {mobileCatalogOpen && (
                        <div className="ml-2 flex flex-col gap-0.5 rounded-md bg-richblack-700/40 py-1">
                          {loading ? (
                            <p className="px-4 py-2 text-richblack-200">
                              Loading...
                            </p>
                          ) : subLinks && subLinks.length ? (
                            subLinks.map((subLink, i) => (
                              <Link
                                key={i}
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="rounded-md px-4 py-2 text-richblack-50 transition hover:bg-richblack-600"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subLink.name}
                              </Link>
                            ))
                          ) : (
                            <p className="px-4 py-2 text-richblack-200">
                              No Courses Found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link?.path}
                      className={`block rounded-md px-3 py-3 font-medium transition ${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      } hover:bg-richblack-700`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 h-px w-full bg-richblack-700" />
            <div className="flex flex-col gap-3">
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link
                  to="/dashboard/cart"
                  className="relative flex items-center gap-2 rounded-md bg-richblack-700/40 px-3 py-2 text-richblack-25 hover:bg-richblack-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AiOutlineShoppingCart className="text-xl" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-100 px-1 text-xs font-bold text-richblack-900">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              {!token && (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="flex-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full rounded-md border border-richblack-700 bg-richblack-800 px-4 py-2 text-sm font-medium text-richblack-100 transition hover:bg-richblack-700">
                      Log in
                    </button>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full rounded-md bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 transition hover:bg-yellow-100">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
              {token && (
                <div className="flex items-center gap-3">
                  <ProfileDropdown />
                  {/* Extra space to keep layout balanced */}
                </div>
              )}
            </div>
            <div className="mt-auto pt-4 text-[11px] text-richblack-400">
              <p>© {new Date().getFullYear()} StudyNation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
