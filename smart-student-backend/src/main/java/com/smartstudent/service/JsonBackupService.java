package com.smartstudent.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstudent.model.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Best-effort, file-based backup of registration (login page) and student
 * profile details. Each save upserts a record into a pretty-printed JSON file
 * so the data can be inspected without opening the database.
 *
 * Files written (under {@code json.backup.dir}, default {@code ./data}):
 *   - registrations.json : one entry per registered account
 *   - profiles.json      : one entry per student profile
 */
@Service
public class JsonBackupService {

    private static final Logger log = LoggerFactory.getLogger(JsonBackupService.class);

    private static final String REGISTRATIONS_FILE = "registrations.json";
    private static final String PROFILES_FILE = "profiles.json";
    private static final String LOGIN_SESSIONS_FILE = "login-sessions.json";

    private final ObjectMapper objectMapper;
    private final File dataDir;

    public JsonBackupService(
        ObjectMapper objectMapper,
        @Value("${json.backup.dir:./data}") String dir
    ) {
        this.objectMapper = objectMapper;
        this.dataDir = new File(dir);
        if (!dataDir.exists() && !dataDir.mkdirs()) {
            log.warn("Could not create JSON backup directory: {}", dataDir.getAbsolutePath());
        }
    }

    /** Persist the details captured on the login/registration page. */
    public synchronized void saveRegistration(
        String email, String role, String name, String rollNo,
        String department, Object semester, String dob
    ) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("email", email);
        record.put("role", role);
        record.put("name", name);
        record.put("rollNo", rollNo);
        record.put("department", department);
        record.put("semester", semester);
        record.put("dob", dob);
        record.put("savedAt", LocalDateTime.now().toString());
        upsert(REGISTRATIONS_FILE, "email", record);
    }

    /**
     * Persist a temporary record of the current login. Only the most recent
     * login is kept (the file is overwritten each time) so it reflects the
     * active session. The plaintext password is intentionally never stored.
     */
    public synchronized void saveLoginSession(String email, String role, String name) {
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("email", email);
        record.put("role", role);
        record.put("name", name);
        record.put("loginAt", LocalDateTime.now().toString());

        List<Map<String, Object>> records = new ArrayList<>();
        records.add(record);
        writeAll(new File(dataDir, LOGIN_SESSIONS_FILE), records);
    }

    /** Persist the My Profile details for a student. */
    public synchronized void saveStudentProfile(Student student, String email) {
        if (student == null) {
            return;
        }
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("rollNo", student.getRollNo());
        record.put("name", student.getName());
        record.put("email", email);
        record.put("dob", student.getDob() != null ? student.getDob().toString() : null);
        record.put("bloodGroup", student.getBloodGroup());
        record.put("phone", student.getPhone());
        record.put("address", student.getAddress());
        record.put("department",
            student.getDepartment() != null ? student.getDepartment().getName() : null);
        record.put("semester", student.getSemester());
        record.put("section", student.getSection());
        record.put("parentName", student.getParentName());
        record.put("parentPhone", student.getParentPhone());
        record.put("savedAt", LocalDateTime.now().toString());
        upsert(PROFILES_FILE, "rollNo", record);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void upsert(String fileName, String key, Map<String, Object> record) {
        File file = new File(dataDir, fileName);
        List<Map<String, Object>> records = readAll(file);

        Object id = record.get(key);
        boolean replaced = false;
        if (id != null) {
            for (int i = 0; i < records.size(); i++) {
                if (id.equals(records.get(i).get(key))) {
                    records.set(i, record);
                    replaced = true;
                    break;
                }
            }
        }
        if (!replaced) {
            records.add(record);
        }
        writeAll(file, records);
    }

    private List<Map<String, Object>> readAll(File file) {
        if (!file.exists() || file.length() == 0) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(
                file,
                objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, Map.class)
            );
        } catch (IOException ex) {
            log.warn("Could not read JSON backup {}, starting fresh: {}",
                file.getName(), ex.getMessage());
            return new ArrayList<>();
        }
    }

    private void writeAll(File file, List<Map<String, Object>> records) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, records);
        } catch (IOException ex) {
            // Backup is best-effort and must never break the main request.
            log.error("Failed to write JSON backup {}: {}", file.getName(), ex.getMessage());
        }
    }
}
