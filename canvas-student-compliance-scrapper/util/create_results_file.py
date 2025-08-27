SECTION_DIVIDER = "\n-----------------\n"

def create_results_file(student_compliance):
    file_path ="./results.txt"
    file = open(file_path, "w")
    with open(file_path, "w") as file:
        file.write(create_students_per_page_string(student_compliance))
        file.write(create_student_report_section_string(student_compliance))

def create_students_per_page_string(student_compliance):
    header = "Students Processed per page"
    description = "Expect 50 students per page, except the last page which may have less:"
    content = ""
    for key, value in student_compliance["students_processed_per_page"].items():
        content += f"\t- Page number {key}: {value} students processed\n"

    return f"{header}\n{description}\n\n{content}{SECTION_DIVIDER}"

def create_student_report_section_string(student_compliance):
    header = "Student report section"
    description = "Students are selected based on if their moderate tab shows the log \"Stopped viewing the quiz-taking page\"."
    content = ""

    student_violations_sorted = sort_students_by_violations(student_compliance["student_violations"])

    for key, value in student_violations_sorted:
        content += f"\t- {key}: {value} violations\n"

    content += f"\n{len(student_violations_sorted)} students were processed."
    return f"{header}\n{description}\n\n{content}{SECTION_DIVIDER}"

def sort_students_by_violations(student_violations):
    return sorted(
        student_violations.items(),
        key=lambda x: x[1],
        reverse=True
    )