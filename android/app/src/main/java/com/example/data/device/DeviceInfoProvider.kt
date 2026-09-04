package com.example.data.device

import android.app.ActivityManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.util.DisplayMetrics
import android.view.WindowManager
import com.example.domain.model.DeviceInfo

class DeviceInfoProvider(private val context: Context) {

  fun getDeviceInfo(): DeviceInfo {
    val manufacturer = Build.MANUFACTURER.replaceFirstChar { it.uppercase() }
    val model = Build.MODEL
    val androidRelease = Build.VERSION.RELEASE
    val sdkInt = Build.VERSION.SDK_INT

    val cpuCores = Runtime.getRuntime().availableProcessors()
    val cpuArchitecture = Build.SUPPORTED_ABIS.firstOrNull() ?: "arm64-v8a"

    val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
    val memInfo = ActivityManager.MemoryInfo()
    actManager?.getMemoryInfo(memInfo)

    val ramTotalGb = if (memInfo.totalMem > 0) {
      memInfo.totalMem.toDouble() / (1024.0 * 1024.0 * 1024.0)
    } else 4.0

    val ramAvailableGb = if (memInfo.availMem > 0) {
      memInfo.availMem.toDouble() / (1024.0 * 1024.0 * 1024.0)
    } else 2.0

    var storageFreeGb = 10.0
    var storageTotalGb = 64.0
    try {
      val dataDir = Environment.getDataDirectory()
      val stat = StatFs(dataDir.path)
      val freeBytes = stat.availableBlocksLong * stat.blockSizeLong
      val totalBytes = stat.blockCountLong * stat.blockSizeLong
      storageFreeGb = freeBytes.toDouble() / (1024.0 * 1024.0 * 1024.0)
      storageTotalGb = totalBytes.toDouble() / (1024.0 * 1024.0 * 1024.0)
    } catch (_: Exception) {}

    val glEsVersion = actManager?.deviceConfigurationInfo?.glEsVersion ?: "3.2"

    val pm = context.packageManager
    val vulkanSupported = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      pm.hasSystemFeature(PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL)
    } else false

    var displayRes: String? = null
    try {
      val wm = context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
      if (wm != null) {
        val dm = DisplayMetrics()
        @Suppress("DEPRECATION")
        wm.defaultDisplay.getRealMetrics(dm)
        displayRes = "${dm.widthPixels} x ${dm.heightPixels}"
      }
    } catch (_: Exception) {}

    return DeviceInfo(
      manufacturer = manufacturer,
      model = model,
      androidRelease = androidRelease,
      sdkInt = sdkInt,
      cpuCores = cpuCores,
      cpuArchitecture = cpuArchitecture,
      ramTotalGb = ramTotalGb,
      ramAvailableGb = ramAvailableGb,
      storageFreeGb = storageFreeGb,
      storageTotalGb = storageTotalGb,
      openGlEsVersion = glEsVersion,
      vulkanSupported = vulkanSupported,
      displayResolution = displayRes
    )
  }
}
