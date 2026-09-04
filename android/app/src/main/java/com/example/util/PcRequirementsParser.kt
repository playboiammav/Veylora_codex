package com.example.util

import com.example.data.remote.model.RawgRequirementsDto
import com.example.domain.model.PcRequirements

object PcRequirementsParser {

  private val MARKER_SYNONYMS = listOf(
    "OS" to listOf("OS", "Operating System"),
    "Processor" to listOf("Processor", "CPU", "Processor / CPU"),
    "Memory" to listOf("Memory / RAM", "Memory", "RAM"),
    "Graphics" to listOf("Graphics / GPU", "Graphics Card", "Graphics", "Video Card", "GPU"),
    "VRAM" to listOf("VRAM", "Video Memory"),
    "DirectX" to listOf("DirectX", "DirectX Version"),
    "Vulkan" to listOf("Vulkan", "Vulkan Version", "Vulkan API"),
    "OpenGL" to listOf("OpenGL", "Open GL", "OpenGL Version", "OpenGL API"),
    "Storage" to listOf("Storage", "Hard Drive", "Available Space", "Disk Space", "Hard Disk Space"),
    "Sound" to listOf("Sound Card", "Sound", "Audio"),
    "Notes" to listOf("Additional Notes", "Other Requirements", "Notes")
  )

  fun parse(rawReq: Any?): PcRequirements? {
    if (rawReq == null) return null

    var minRaw: String? = null
    var recRaw: String? = null

    when (rawReq) {
      is RawgRequirementsDto -> {
        minRaw = rawReq.minimum
        recRaw = rawReq.recommended
      }
      is com.example.data.remote.model.VeyloraRawRequirementsDto -> {
        minRaw = rawReq.minimum
        recRaw = rawReq.recommended
      }
      is com.example.data.remote.model.VeyloraSystemRequirementsBlockDto -> {
        val minDto = rawReq.minimum
        val recDto = rawReq.recommended
        if (minDto != null || recDto != null) {
          return PcRequirements(
            minimum = minDto?.additionalNotes,
            recommended = recDto?.additionalNotes,
            minOs = minDto?.os,
            minCpu = minDto?.processor,
            minRam = minDto?.memory,
            minGpu = minDto?.graphics,
            minVram = minDto?.vram,
            minDirectX = minDto?.directx,
            minVulkan = minDto?.vulkan,
            minOpenGl = minDto?.opengl,
            minStorage = minDto?.storage,
            minNotes = minDto?.additionalNotes,
            recOs = recDto?.os,
            recCpu = recDto?.processor,
            recRam = recDto?.memory,
            recGpu = recDto?.graphics,
            recVram = recDto?.vram,
            recStorage = recDto?.storage,
            recDirectX = recDto?.directx,
            recVulkan = recDto?.vulkan,
            recOpenGl = recDto?.opengl,
            recNotes = recDto?.additionalNotes
          )
        }
      }
      is Map<*, *> -> {
        minRaw = rawReq["minimum"]?.toString()
        recRaw = rawReq["recommended"]?.toString()
      }
      is String -> {
        val cleaned = cleanHtml(rawReq)
        val recIdx = cleaned.indexOf("Recommended:", ignoreCase = true)
        if (recIdx != -1) {
          minRaw = cleaned.substring(0, recIdx)
          recRaw = cleaned.substring(recIdx)
        } else {
          minRaw = cleaned
        }
      }
    }

    val minClean = cleanHtml(minRaw)
    val recClean = cleanHtml(recRaw)

    if (minClean.isBlank() && recClean.isBlank()) return null

    val minMap = extractSpecsFromBlock(minClean)
    val recMap = extractSpecsFromBlock(recClean)

    return PcRequirements(
      minimum = minClean.ifBlank { null },
      recommended = recClean.ifBlank { null },
      minOs = minMap["OS"],
      minCpu = minMap["Processor"],
      minRam = minMap["Memory"],
      minGpu = minMap["Graphics"],
      minVram = minMap["VRAM"],
      minDirectX = minMap["DirectX"],
      minVulkan = minMap["Vulkan"],
      minOpenGl = minMap["OpenGL"],
      minStorage = minMap["Storage"],
      minNotes = minMap["Notes"],
      recOs = recMap["OS"],
      recCpu = recMap["Processor"],
      recRam = recMap["Memory"],
      recGpu = recMap["Graphics"],
      recVram = recMap["VRAM"],
      recStorage = recMap["Storage"],
      recDirectX = recMap["DirectX"],
      recVulkan = recMap["Vulkan"],
      recOpenGl = recMap["OpenGL"],
      recNotes = recMap["Notes"]
    )
  }

  fun cleanHtml(html: String?): String {
    if (html.isNullOrBlank()) return ""

    var text = html
      .replace("\r\n", "\n")
      .replace("\r", "\n")
      .replace(Regex("(?i)<br\\s*/?>"), "\n")
      .replace(Regex("(?i)</p>"), "\n\n")
      .replace(Regex("(?i)</li>"), "\n")
      .replace(Regex("(?i)</div>"), "\n")
      .replace(Regex("(?i)<[^>]+>"), " ")
      .replace("&nbsp;", " ")
      .replace("&amp;", "&")
      .replace("&quot;", "\"")
      .replace("&#39;", "'")
      .replace("&#x27;", "'")
      .replace("&lt;", "<")
      .replace("&gt;", ">")

    // Separate concatenated keywords lacking newlines (e.g. "Minimum:OS: Windows...Processor: Intel...")
    val kwList = listOf(
      "Minimum", "Recommended", "Requires a 64-bit",
      "OS", "Operating System", "Processor", "CPU", "Memory", "RAM",
      "Graphics", "Video Card", "GPU", "VRAM", "Video Memory",
      "Storage", "Hard Drive", "Disk Space", "Hard Disk Space",
      "DirectX", "Direct X", "Vulkan", "OpenGL", "Open GL",
      "Sound Card", "Sound", "Notes", "Additional Notes"
    ).sortedByDescending { it.length }

    val regex = Regex("([a-zA-Z0-9\\)\\.\\*\\:])(${kwList.joinToString("|") { Regex.escape(it) }}):", RegexOption.IGNORE_CASE)
    text = text.replace(regex, "$1\n$2:")

    return text
      .lines()
      .map { it.trim() }
      .filter { it.isNotBlank() }
      .joinToString("\n")
      .trim()
  }

  private data class MarkerMatch(
    val category: String,
    val startIndex: Int,
    val matchLength: Int
  )

  fun extractSpecsFromBlock(rawBlock: String): Map<String, String> {
    if (rawBlock.isBlank()) return emptyMap()

    val block = rawBlock
      .replace(Regex("(?i)^\\s*(Minimum|Recommended):\\s*"), "")
      .trim()

    val foundMarkers = mutableListOf<MarkerMatch>()

    for ((category, synonyms) in MARKER_SYNONYMS) {
      for (syn in synonyms) {
        val regex = Regex("(?i)(?:^|\\n|;|\\b)\\s*${Regex.escape(syn)}\\s*:", RegexOption.IGNORE_CASE)
        val match = regex.find(block)
        if (match != null) {
          foundMarkers.add(
            MarkerMatch(
              category = category,
              startIndex = match.range.first,
              matchLength = match.value.length
            )
          )
          break
        }
      }
    }

    foundMarkers.sortBy { it.startIndex }

    val result = mutableMapOf<String, String>()

    for (i in foundMarkers.indices) {
      val current = foundMarkers[i]
      val valueStart = current.startIndex + current.matchLength
      val valueEnd = if (i + 1 < foundMarkers.size) {
        foundMarkers[i + 1].startIndex
      } else {
        block.length
      }

      if (valueStart < valueEnd && valueStart < block.length) {
        val rawValue = block.substring(valueStart, valueEnd.coerceAtMost(block.length))
        val cleanValue = cleanSpecValue(rawValue)
        if (cleanValue.isNotBlank()) {
          result[current.category] = cleanValue
        }
      }
    }

    return result
  }

  private fun cleanSpecValue(raw: String): String {
    return raw
      .replace(Regex("^\\s*:\\s*"), "")
      .replace(Regex("[;,\\s]+$"), "")
      .trim()
  }
}
