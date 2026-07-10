"""
Seed script to import curriculum data from a JSON file (no codes for any level).
Usage:
    python seed_from_json.py [json_file]
"""

import json
import sys
from app.core.database import SessionLocal
from app.models.subject import Subject
from app.models.content_standard import ContentStandard
from app.models.performance_standard import PerformanceStandard
from app.models.learning_competency import LearningCompetency

def seed_from_json(filepath='curriculum_data.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    school_year = data.get('school_year')
    term = data.get('term')
    if not school_year or not term:
        print("Error: 'school_year' and 'term' must be defined.")
        return

    db = SessionLocal()
    try:
        for subject_data in data['subjects']:
            subject_name = subject_data['name']
            subject = db.query(Subject).filter(Subject.name == subject_name).first()
            if not subject:
                subject = Subject(name=subject_name, code=subject_data.get('code', ''))
                db.add(subject)
                db.flush()
                print(f"Created subject: {subject_name}")

            for cs_data in subject_data.get('content_standards', []):
                # Match by description + subject + term + school_year
                cs = db.query(ContentStandard).filter(
                    ContentStandard.description == cs_data['description'],
                    ContentStandard.subject_id == subject.id,
                    ContentStandard.term == term,
                    ContentStandard.school_year == school_year
                ).first()

                if cs:
                    cs.description = cs_data['description']
                else:
                    cs = ContentStandard(
                        description=cs_data['description'],
                        subject_id=subject.id,
                        term=term,
                        school_year=school_year
                    )
                    db.add(cs)
                    db.flush()

                for ps_data in cs_data.get('performance_standards', []):
                    ps = db.query(PerformanceStandard).filter(
                        PerformanceStandard.description == ps_data['description'],
                        PerformanceStandard.subject_id == subject.id,
                        PerformanceStandard.term == term,
                        PerformanceStandard.school_year == school_year
                    ).first()

                    if ps:
                        ps.description = ps_data['description']
                        ps.content_standard_id = cs.id
                    else:
                        ps = PerformanceStandard(
                            description=ps_data['description'],
                            content_standard_id=cs.id,
                            subject_id=subject.id,
                            term=term,
                            school_year=school_year
                        )
                        db.add(ps)
                        db.flush()

                    # Process competencies
                    for comp_data in ps_data.get('competencies', []):
                        comp = db.query(LearningCompetency).filter(
                            LearningCompetency.description == comp_data['description'],
                            LearningCompetency.performance_standard_id == ps.id
                        ).first()

                        if comp:
                            comp.description = comp_data['description']
                            comp.performance_standard_id = ps.id
                        else:
                            comp = LearningCompetency(
                                description=comp_data['description'],
                                performance_standard_id=ps.id
                            )
                            db.add(comp)

        db.commit()
        print("✅ Curriculum imported successfully.")
    except Exception as e:
        db.rollback()
        print("❌ Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    json_file = sys.argv[1] if len(sys.argv) > 1 else 'curriculum_data.json'
    seed_from_json(json_file)