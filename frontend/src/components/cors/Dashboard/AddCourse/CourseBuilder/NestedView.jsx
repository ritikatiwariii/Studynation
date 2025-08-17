import { useEffect, useState } from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
    deleteSection,
    deleteSubSection,
} from "../../../../../service/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import ConfirmationModal from "../../../../common/ConfirmationModal"
import SubSectionModal from "./SubSectionModal"

export default function NestedView({ handleChangeEditSectionName }) {
    const { course } = useSelector((state) => state.course)
    const { token } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    // States to keep track of mode of modal [add, view, edit]
    const [addSubSection, setAddSubsection] = useState(null)
    const [viewSubSection, setViewSubSection] = useState(null)
    const [editSubSection, setEditSubSection] = useState(null)
    // to keep track of confirmation modal
    const [confirmationModal, setConfirmationModal] = useState(null)

    const handleDeleleSection = async (sectionId) => {
        const result = await deleteSection({
            sectionId,
            courseId: course._id,
            token,
        })
        if (result) {
            dispatch(setCourse(result))
        }
        setConfirmationModal(null)
    }

    const handleDeleteSubSection = async (subSectionId, sectionId) => {
        const result = await deleteSubSection({ subSectionId, sectionId }, token)
        if (result) {
            // update the structure of course
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === sectionId ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setConfirmationModal(null)
    }

    // For now, let's just show a placeholder title
    const getSubsectionTitle = (subSectionId) => {
        if (!subSectionId) return "Lecture";
        const idString = String(subSectionId);
        return `Lecture ${idString.slice(-4)}`; // Show last 4 characters of the ID
    };

    return (
        <>
            <div
                className="rounded-lg bg-richblack-700 p-6 px-8"
                id="nestedViewContainer"
            >
                {course?.courseContent?.map((section) => (
                    // Section Dropdown
                    <details key={section._id} open>
                        {/* Section Dropdown Content */}
                        <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
                            <div className="flex items-center gap-x-3">
                                <RxDropdownMenu className="text-2xl text-richblack-50" />
                                <p className="font-semibold text-richblack-50">
                                    {section.sectionName}
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <button
                                    onClick={() =>
                                        handleChangeEditSectionName(
                                            section._id,
                                            section.sectionName
                                        )
                                    }
                                >
                                    <MdEdit className="text-xl text-richblack-300" />
                                </button>
                                <button
                                    onClick={() =>
                                        setConfirmationModal({
                                            text1: "Delete this Section?",
                                            text2: "All the lectures in this section will be deleted",
                                            btn1Text: "Delete",
                                            btn2Text: "Cancel",
                                            btn1Handler: () => handleDeleleSection(section._id),
                                            btn2Handler: () => setConfirmationModal(null),
                                        })
                                    }
                                >
                                    <RiDeleteBin6Line className="text-xl text-richblack-300" />
                                </button>
                                <span className="font-medium text-richblack-300">|</span>
                                <AiFillCaretDown className={`text-xl text-richblack-300`} />
                            </div>
                        </summary>
                        <div className="px-6 pb-4">
                            {/* Render All Sub Sections Within a Section */}
                            {section.subSection.map((data, index) => (
                                <div
                                    key={data || `subsection-${index}`}
                                    onClick={() => setViewSubSection(data)}
                                    className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                                >
                                    <div className="flex items-center gap-x-3 py-2 ">
                                        <RxDropdownMenu className="text-2xl text-richblack-50" />
                                        <p className="text-richblack-50">{getSubsectionTitle(data)}</p>
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditSubSection(data)
                                            }}
                                        >
                                            <MdEdit className="text-xl text-richblack-300" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConfirmationModal({
                                                    text1: "Delete this Sub Section?",
                                                    text2: "This lecture will be deleted",
                                                    btn1Text: "Delete",
                                                    btn2Text: "Cancel",
                                                    btn1Handler: () =>
                                                        handleDeleteSubSection(data, section._id),
                                                    btn2Handler: () => setConfirmationModal(null),
                                                })
                                            }}
                                        >
                                            <RiDeleteBin6Line className="text-xl text-richblack-300" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Add Sub Section Button */}
                            <button
                                onClick={() => setAddSubsection(section._id)}
                                className="mt-4 flex items-center gap-x-2 text-yellow-50"
                            >
                                <FaPlus className="text-lg" />
                                <p>Add Lecture</p>
                            </button>
                        </div>
                    </details>
                ))}
            </div>
            {/* Modals */}
            {addSubSection ? (
                <SubSectionModal
                    modalData={addSubSection}
                    setModalData={setAddSubsection}
                    add={true}
                    view={false}
                    edit={false}
                />
            ) : viewSubSection ? (
                <SubSectionModal
                    modalData={viewSubSection}
                    setModalData={setViewSubSection}
                    add={false}
                    view={true}
                    edit={false}
                />
            ) : editSubSection ? (
                <SubSectionModal
                    modalData={editSubSection}
                    setModalData={setEditSubSection}
                    add={false}
                    view={false}
                    edit={true}
                />
            ) : null}
            {/* Confirmation Modal */}
            {confirmationModal ? (
                <ConfirmationModal modalData={confirmationModal} />
            ) : null}
        </>
    )
}