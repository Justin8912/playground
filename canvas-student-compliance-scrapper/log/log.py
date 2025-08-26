def print_compliance_report(student_compliance):
    print("\n" + "="*50)
    print("STUDENT COMPLIANCE REPORT")
    print("="*50)

    if not student_compliance:
        print("No data collected.")
        return

    # Sort by number of violations (descending)
    sorted_students = sorted(
        student_compliance.items(),
        key=lambda x: x[1],
        reverse=True
    )

    for student_name, violation_count in sorted_students:
        print(f"{student_name}: {violation_count} violations")

    total_violations = sum(student_compliance.values())
    total_students = len(student_compliance)
    average_violations = total_violations / total_students if total_students > 0 else 0

    print("-"*50)
    print(f"Total Students: {total_students}")
    print(f"Total Violations: {total_violations}")
    print(f"Average Violations per Student: {average_violations:.2f}")
